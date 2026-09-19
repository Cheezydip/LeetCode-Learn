/**
 * User Sync Controller
 * 
 * Handles LeetCode profile ingestion, 10-minute cooldown enforcement,
 * and bio token account verification.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { importFullUserStats, verifyBioToken, fetchSolvedProblemsWithCookie } = require('../services/leetcodeService');
const { normalizeTopicMetrics } = require('../services/normalizerService');
const { lookupProblems } = require('../services/problemEnrichmentService');
const { supabase } = require('../config/supabase');

const COOLDOWN_MINUTES = 10;
const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

// Local persistent file cache for user solved problems (fall back when Supabase tables not yet created)
const USER_SOLVED_CACHE_DIR = path.join(__dirname, '../data/cache/user_solved');
if (!fs.existsSync(USER_SOLVED_CACHE_DIR)) {
  fs.mkdirSync(USER_SOLVED_CACHE_DIR, { recursive: true });
}

function getLocalUserSolvedPath(handle) {
  const safeHandle = (handle || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  return path.join(USER_SOLVED_CACHE_DIR, `${safeHandle}.json`);
}

function readLocalUserSolved(handle) {
  try {
    const filePath = getLocalUserSolvedPath(handle);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return Array.isArray(data) ? data : (data.solvedSlugs || []);
    }
  } catch (err) {
    console.warn(`[LocalCache] Failed reading solved cache for ${handle}:`, err.message);
  }
  return [];
}

function writeLocalUserSolved(handle, slugs) {
  try {
    const filePath = getLocalUserSolvedPath(handle);
    const unique = Array.from(new Set((slugs || []).map(s => String(s).trim().toLowerCase())));
    fs.writeFileSync(filePath, JSON.stringify({
      handle,
      solvedSlugs: unique,
      totalSolvedCount: unique.length,
      updatedAt: new Date().toISOString()
    }, null, 2), 'utf-8');
    return unique;
  } catch (err) {
    console.warn(`[LocalCache] Failed writing solved cache for ${handle}:`, err.message);
    return slugs || [];
  }
}


/**
 * POST /api/users/:handle/sync
 * Syncs LeetCode stats with 10-minute live query cooldown
 */
async function syncUserStats(req, res, next) {
  const { handle } = req.params;
  const region = req.query?.region || req.body?.region || 'global';

  if (!handle || typeof handle !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid LeetCode handle is required.' });
  }

  try {
    const cleanHandle = handle.replace(/^@/, '').trim();

    // 1. Check existing user in database for 10-minute cooldown
    let cachedUser = null;
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .ilike('leetcode_handle', cleanHandle)
        .maybeSingle();
      cachedUser = data;
    } catch (dbErr) {
      // If DB is temporarily unavailable or table schema pending, log and continue
      console.warn('Database query bypassed:', dbErr.message);
    }

    const forceSync = req.query?.force === 'true';
    const cachedTopicCount = Object.keys(cachedUser?.topic_metrics || {}).length;

    if (!forceSync && cachedUser && cachedUser.last_synced_at && cachedTopicCount > 8) {
      const lastSync = new Date(cachedUser.last_synced_at).getTime();
      const now = Date.now();
      const elapsed = now - lastSync;

      if (elapsed < COOLDOWN_MS) {
        const remainingSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000);
        return res.status(200).json({
          success: true,
          cached: true,
          message: `Served from cache. Next live sync available in ${Math.ceil(remainingSeconds / 60)} min (${remainingSeconds}s).`,
          cooldownRemainingSeconds: remainingSeconds,
          data: cachedUser,
        });
      }
    }

    // 2. Fetch fresh stats from LeetCode GraphQL
    const rawStats = await importFullUserStats(cleanHandle, region);

    // 3. Normalize Topic Competency for 56-Topic Model
    const topicMetrics = normalizeTopicMetrics(rawStats.rawTags, rawStats.contestElo);

    // 4. Auto-merge newly discovered accepted submissions into solved_slugs (cumulative sync)
    const localSlugs = readLocalUserSolved(cleanHandle);
    const existingSolvedSlugs = Array.isArray(cachedUser?.solved_slugs) ? cachedUser.solved_slugs : [];
    const recentSlugs = (rawStats.recentAc || []).map(s => s.titleSlug).filter(Boolean);
    const mergedSolvedSlugs = Array.from(new Set([...localSlugs, ...existingSolvedSlugs, ...recentSlugs]));
    writeLocalUserSolved(cleanHandle, mergedSolvedSlugs);

    // 4b. Supplement topicMetrics with mergedSolvedSlugs counts if higher
    if (mergedSolvedSlugs.length > 0) {
      try {
        const enrichedMerged = await lookupProblems(mergedSolvedSlugs);
        const mergedCounts = {};
        enrichedMerged.forEach(p => {
          (p.topicSlugs || []).forEach(tKey => {
            mergedCounts[tKey] = (mergedCounts[tKey] || 0) + 1;
          });
        });
        Object.entries(mergedCounts).forEach(([tKey, count]) => {
          if (topicMetrics[tKey]) {
            topicMetrics[tKey].problemsSolved = Math.max(topicMetrics[tKey].problemsSolved || 0, count);
          }
        });
      } catch (e) {
        console.warn('Could not supplement topicMetrics during sync:', e.message);
      }
    }

    const payload = {
      leetcode_handle: rawStats.handle,
      region: rawStats.region,
      avatar: rawStats.avatar,
      real_name: rawStats.realName,
      about_me: rawStats.aboutMe,
      profile_rank: rawStats.profileRank,
      contest_elo: rawStats.contestElo,
      contest_rank: rawStats.contestRank,
      top_percentage: rawStats.topPercentage,
      attended_contests: rawStats.attendedContestsCount,
      is_unrated: rawStats.isUnrated,
      total_solved: rawStats.totalSolved,
      easy_solved: rawStats.easySolved,
      medium_solved: rawStats.mediumSolved,
      hard_solved: rawStats.hardSolved,
      topic_metrics: topicMetrics,
      recent_submissions: rawStats.recentAc,
      solved_slugs: mergedSolvedSlugs,
      last_synced_at: new Date().toISOString(),
    };

    // 5. Save/Upsert into Supabase (if configured)
    let savedRecord = payload;
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(payload, { onConflict: 'leetcode_handle' })
        .select()
        .maybeSingle();

      if (!error && data) {
        savedRecord = data;
      }
    } catch (saveErr) {
      console.warn('Could not persist to Supabase:', saveErr.message);
    }

    return res.status(200).json({
      success: true,
      cached: false,
      message: `Successfully synced live metrics for @${cleanHandle} from LeetCode (${region}).`,
      data: savedRecord,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }
}

/**
 * POST /api/users/:handle/generate-token
 * Generates a verification token (LC-LEARN-XXXX) for 10-second bio confirmation
 */
async function generateVerificationToken(req, res, next) {
  const { handle } = req.params;
  const cleanHandle = handle.replace(/^@/, '').trim();
  const tokenNumber = crypto.randomInt(1000, 9999);
  const token = `LC-LEARN-${tokenNumber}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min TTL

  try {
    try {
      await supabase
        .from('users')
        .upsert({
          leetcode_handle: cleanHandle,
          verification_token: token,
          verification_token_expires_at: expiresAt,
          is_verified: false,
        }, { onConflict: 'leetcode_handle' });
    } catch (dbErr) {
      console.warn('Could not persist verification token to DB:', dbErr.message);
    }

    return res.status(200).json({
      success: true,
      handle: cleanHandle,
      verificationToken: token,
      expiresAt,
      instructions: `Add "${token}" anywhere into your LeetCode profile bio ("About Me"), then click 'Verify Profile'. You can remove it right after verification.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * POST /api/users/:handle/verify-token
 * Queries LeetCode profile bio to confirm token ownership
 */
async function verifyUserToken(req, res, next) {
  const { handle } = req.params;
  const { token, region = 'global' } = req.body;
  const cleanHandle = handle.replace(/^@/, '').trim();

  if (!token) {
    return res.status(400).json({ success: false, error: 'Verification token is required.' });
  }

  try {
    const check = await verifyBioToken(cleanHandle, token, region);

    if (!check.verified) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: `Token "${token}" was not found in @${cleanHandle}'s LeetCode bio. Please add it to your LeetCode "About Me" profile and try again.`,
        currentBio: check.currentBio,
      });
    }

    // Persist verified state in Supabase
    try {
      await supabase
        .from('users')
        .update({
          is_verified: true,
          verification_token: null,
          verification_token_expires_at: null,
        })
        .ilike('leetcode_handle', cleanHandle);
    } catch (dbErr) {
      console.warn('DB verification status update skipped:', dbErr.message);
    }

    // Immediately ingest fresh user stats so cockpit unlocks with real data
    let syncedData = null;
    try {
      const rawStats = await importFullUserStats(cleanHandle, region);
      const topicMetrics = normalizeTopicMetrics(rawStats.rawTags, rawStats.contestElo);
      const payload = {
        leetcode_handle: rawStats.handle,
        region: rawStats.region,
        avatar: rawStats.avatar,
        real_name: rawStats.realName,
        about_me: rawStats.aboutMe,
        profile_rank: rawStats.profileRank,
        contest_elo: rawStats.contestElo,
        contest_rank: rawStats.contestRank,
        top_percentage: rawStats.topPercentage,
        attended_contests: rawStats.attendedContestsCount,
        is_unrated: rawStats.isUnrated,
        total_solved: rawStats.totalSolved,
        easy_solved: rawStats.easySolved,
        medium_solved: rawStats.mediumSolved,
        hard_solved: rawStats.hardSolved,
        topic_metrics: topicMetrics,
        recent_submissions: rawStats.recentAc,
        last_synced_at: new Date().toISOString(),
        is_verified: true,
      };

      try {
        const { data } = await supabase
          .from('users')
          .upsert(payload, { onConflict: 'leetcode_handle' })
          .select()
          .maybeSingle();
        syncedData = data || payload;
      } catch (dbErr) {
        syncedData = payload;
      }
    } catch (importErr) {
      console.warn('Post-verification stat ingestion warning:', importErr.message);
    }

    return res.status(200).json({
      success: true,
      verified: true,
      handle: cleanHandle,
      message: `Account @${cleanHandle} successfully verified and linked!`,
      data: syncedData,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

/**
 * Shared Helper: Process problem slugs, map to 56 topics, and persist
 */
async function processAndStoreSolvedProblems(handle, rawList, source = 'import') {
  const cleanHandle = handle.replace(/^@/, '').trim();
  
  // Extract and normalize slugs
  const inputSlugs = rawList.map(item => {
    if (typeof item === 'string') return item.trim().toLowerCase();
    if (item?.titleSlug) return item.titleSlug.trim().toLowerCase();
    if (item?.slug) return item.slug.trim().toLowerCase();
    if (item?.stat?.question__title_slug) return item.stat.question__title_slug.trim().toLowerCase();
    if (item?.question__title_slug) return item.question__title_slug.trim().toLowerCase();
    if (item?.questionId && item?.title) return item.title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return null;
  }).filter(Boolean);

  const uniqueSlugs = Array.from(new Set(inputSlugs));
  if (uniqueSlugs.length === 0) {
    return {
      importedCount: 0,
      totalSolvedCount: 0,
      solvedSlugs: [],
      solvedByTopic: {},
      topicCounts: {},
    };
  }

  // 1. Read existing from local file cache
  const localSlugs = readLocalUserSolved(cleanHandle);

  // 2. Query existing user from Supabase if available
  let supabaseSlugs = [];
  try {
    const { data: userRecord } = await supabase
      .from('users')
      .select('solved_slugs')
      .ilike('leetcode_handle', cleanHandle)
      .maybeSingle();
    if (userRecord?.solved_slugs && Array.isArray(userRecord.solved_slugs)) {
      supabaseSlugs = userRecord.solved_slugs;
    }
  } catch (err) {
    console.warn('Could not read existing solved slugs from Supabase:', err.message);
  }

  const allMergedSlugs = Array.from(new Set([...localSlugs, ...supabaseSlugs, ...uniqueSlugs]));

  // 3. Persist to local file cache immediately (ensures instant availability even without Supabase tables)
  writeLocalUserSolved(cleanHandle, allMergedSlugs);

  // 4. Enrich all merged solved problems to group by 56 topics
  const allEnrichedProblems = await lookupProblems(allMergedSlugs);

  const solvedByTopic = {};
  const topicCounts = {};

  allEnrichedProblems.forEach(prob => {
    (prob.topicSlugs || []).forEach(topicKey => {
      if (!solvedByTopic[topicKey]) {
        solvedByTopic[topicKey] = [];
        topicCounts[topicKey] = 0;
      }
      solvedByTopic[topicKey].push({
        titleSlug: prob.titleSlug,
        title: prob.title,
        difficulty: prob.difficulty,
        frontendQuestionId: prob.frontendQuestionId,
        acRate: prob.acRate,
      });
      topicCounts[topicKey]++;
    });
  });

  // 5. Update user's solved_slugs in Supabase (if table exists)
  try {
    await supabase
      .from('users')
      .update({
        solved_slugs: allMergedSlugs,
        updated_at: new Date().toISOString()
      })
      .ilike('leetcode_handle', cleanHandle);
  } catch (err) {
    console.warn('Could not update solved_slugs on users table:', err.message);
  }

  // 6. Upsert newly incoming into user_solved_problems in batches of 100
  const incomingEnriched = await lookupProblems(uniqueSlugs);
  const rows = incomingEnriched.map(p => ({
    leetcode_handle: cleanHandle,
    title_slug: p.titleSlug,
    title: p.title,
    difficulty: p.difficulty,
    topic_slugs: p.topicSlugs,
    source,
    solved_at: new Date().toISOString()
  }));

  try {
    for (let i = 0; i < rows.length; i += 100) {
      const chunk = rows.slice(i, i + 100);
      await supabase
        .from('user_solved_problems')
        .upsert(chunk, { onConflict: 'leetcode_handle,title_slug' });
    }
  } catch (err) {
    console.warn('Could not upsert user_solved_problems:', err.message);
  }

  return {
    importedCount: uniqueSlugs.length,
    totalSolvedCount: allMergedSlugs.length,
    solvedSlugs: allMergedSlugs,
    solvedByTopic,
    topicCounts,
  };
}

/**
 * POST /api/users/:handle/import-solved (Option 1: Browser Console Snippet import)
 * Accepts { solvedSlugs: [...] } or { solvedProblems: [...] }
 */
async function importSolvedProblems(req, res) {
  const { handle } = req.params;
  const { solvedSlugs, solvedProblems, source = 'import' } = req.body || {};

  if (!handle) {
    return res.status(400).json({ success: false, error: 'User handle is required.' });
  }

  const rawList = Array.isArray(req.body)
    ? req.body
    : (req.body?.solvedProblems || req.body?.solvedSlugs || req.body?.stat_status_pairs || req.body?.data || []);
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return res.status(400).json({ success: false, error: 'An array of solvedSlugs or solvedProblems is required.' });
  }

  try {
    const result = await processAndStoreSolvedProblems(handle, rawList, source);
    return res.status(200).json({
      success: true,
      message: `Successfully imported ${result.importedCount} solved problems.`,
      data: result,
    });
  } catch (err) {
    console.error('[Import Solved Error]:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/users/:handle/import-cookie-solved (Option 2: 1-Time Session Cookie Import)
 * Queries LeetCode with disposable LEETCODE_SESSION cookie and immediately discards it
 */
async function importCookieSolved(req, res) {
  const { handle } = req.params;
  const { sessionCookie, region = 'global' } = req.body || {};

  if (!handle) {
    return res.status(400).json({ success: false, error: 'User handle is required.' });
  }
  if (!sessionCookie || typeof sessionCookie !== 'string' || sessionCookie.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'A valid LEETCODE_SESSION cookie is required.' });
  }

  try {
    // 1. Query LeetCode's authenticated endpoint
    const questions = await fetchSolvedProblemsWithCookie(sessionCookie, region);

    // 2. sessionCookie is DISCARDED immediately — never stored in memory or database

    // 3. Process and persist problem catalog mappings
    const result = await processAndStoreSolvedProblems(handle, questions, 'cookie');

    return res.status(200).json({
      success: true,
      message: `Successfully authenticated and imported ${result.importedCount} lifetime solved problems. Session cookie was discarded.`,
      data: result,
    });
  } catch (err) {
    console.error('[Cookie Import Error]:', err.message);
    return res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * GET /api/users/:handle/solved
 * Returns the list of solved slugs and topic breakdown for the requested handle
 */
async function getUserSolvedProblems(req, res) {
  const { handle } = req.params;
  if (!handle) {
    return res.status(400).json({ success: false, error: 'User handle is required.' });
  }

  try {
    const cleanHandle = handle.replace(/^@/, '').trim();
    
    // 1. Read from local persistent cache
    let solvedSlugs = readLocalUserSolved(cleanHandle);

    // 2. Supplement from Supabase if available
    try {
      const { data: userRecord } = await supabase
        .from('users')
        .select('solved_slugs')
        .ilike('leetcode_handle', cleanHandle)
        .maybeSingle();

      if (userRecord?.solved_slugs && Array.isArray(userRecord.solved_slugs)) {
        const merged = Array.from(new Set([...solvedSlugs, ...userRecord.solved_slugs]));
        if (merged.length > solvedSlugs.length) {
          solvedSlugs = merged;
          writeLocalUserSolved(cleanHandle, solvedSlugs);
        }
      }
    } catch (dbErr) {
      console.warn('Database query bypassed in getUserSolvedProblems:', dbErr.message);
    }

    const enriched = await lookupProblems(solvedSlugs);
    const solvedByTopic = {};
    const topicCounts = {};

    enriched.forEach(prob => {
      (prob.topicSlugs || []).forEach(topicKey => {
        if (!solvedByTopic[topicKey]) {
          solvedByTopic[topicKey] = [];
          topicCounts[topicKey] = 0;
        }
        solvedByTopic[topicKey].push({
          titleSlug: prob.titleSlug,
          title: prob.title,
          difficulty: prob.difficulty,
          frontendQuestionId: prob.frontendQuestionId,
          acRate: prob.acRate,
        });
        topicCounts[topicKey]++;
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        handle: cleanHandle,
        totalSolvedCount: solvedSlugs.length,
        solvedSlugs,
        solvedByTopic,
        topicCounts,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * POST /api/users/:handle/toggle-solved
 * Toggles a single problem solved / unsolved
 */
async function toggleProblemSolved(req, res) {
  const { handle } = req.params;
  const { titleSlug, isSolved = true } = req.body || {};

  if (!handle || !titleSlug) {
    return res.status(400).json({ success: false, error: 'handle and titleSlug are required.' });
  }

  try {
    const cleanHandle = handle.replace(/^@/, '').trim();
    const cleanSlug = titleSlug.trim().toLowerCase();

    // 1. Read from local cache
    let solvedSlugs = readLocalUserSolved(cleanHandle);

    try {
      const { data: userRecord } = await supabase
        .from('users')
        .select('solved_slugs')
        .ilike('leetcode_handle', cleanHandle)
        .maybeSingle();

      if (userRecord?.solved_slugs && Array.isArray(userRecord.solved_slugs)) {
        solvedSlugs = Array.from(new Set([...solvedSlugs, ...userRecord.solved_slugs]));
      }
    } catch (dbErr) {
      console.warn('Database query bypassed in toggleProblemSolved:', dbErr.message);
    }

    let updatedSlugs;
    if (isSolved) {
      updatedSlugs = Array.from(new Set([...solvedSlugs, cleanSlug]));
      const [enriched] = await lookupProblems([cleanSlug]);
      try {
        await supabase
          .from('user_solved_problems')
          .upsert({
            leetcode_handle: cleanHandle,
            title_slug: cleanSlug,
            title: enriched?.title || cleanSlug,
            difficulty: enriched?.difficulty || 'Medium',
            topic_slugs: enriched?.topicSlugs || [],
            source: 'manual',
            solved_at: new Date().toISOString()
          }, { onConflict: 'leetcode_handle,title_slug' });
      } catch (err) {
        console.warn('Could not upsert user_solved_problems in toggle:', err.message);
      }
    } else {
      updatedSlugs = solvedSlugs.filter(s => s !== cleanSlug);
      try {
        await supabase
          .from('user_solved_problems')
          .delete()
          .ilike('leetcode_handle', cleanHandle)
          .eq('title_slug', cleanSlug);
      } catch (err) {
        console.warn('Could not delete user_solved_problems in toggle:', err.message);
      }
    }

    // Persist to local file cache
    writeLocalUserSolved(cleanHandle, updatedSlugs);

    try {
      await supabase
        .from('users')
        .update({ solved_slugs: updatedSlugs, updated_at: new Date().toISOString() })
        .ilike('leetcode_handle', cleanHandle);
    } catch (err) {
      console.warn('Could not update users table in toggle:', err.message);
    }

    // Compute updated topic mappings
    const allEnriched = await lookupProblems(updatedSlugs);
    const solvedByTopic = {};
    const topicCounts = {};
    allEnriched.forEach(prob => {
      (prob.topicSlugs || []).forEach(tKey => {
        if (!solvedByTopic[tKey]) {
          solvedByTopic[tKey] = [];
          topicCounts[tKey] = 0;
        }
        solvedByTopic[tKey].push({
          titleSlug: prob.titleSlug,
          title: prob.title,
          difficulty: prob.difficulty,
          frontendQuestionId: prob.frontendQuestionId,
          acRate: prob.acRate,
        });
        topicCounts[tKey]++;
      });
    });

    let easySolvedCount = 0;
    let mediumSolvedCount = 0;
    let hardSolvedCount = 0;
    allEnriched.forEach(prob => {
      const d = (prob.difficulty || '').toLowerCase();
      if (d === 'easy') easySolvedCount++;
      else if (d === 'medium') mediumSolvedCount++;
      else if (d === 'hard') hardSolvedCount++;
    });

    const responsePayload = {
      titleSlug: cleanSlug,
      isSolved: !!isSolved,
      totalSolvedCount: updatedSlugs.length,
      easySolvedCount,
      mediumSolvedCount,
      hardSolvedCount,
      solvedSlugs: updatedSlugs,
      solvedByTopic,
      topicCounts,
    };

    return res.status(200).json({
      success: true,
      ...responsePayload,
      data: responsePayload,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  syncUserStats,
  generateVerificationToken,
  verifyUserToken,
  importSolvedProblems,
  importCookieSolved,
  getUserSolvedProblems,
  toggleProblemSolved,
};
