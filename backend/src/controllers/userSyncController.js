/**
 * User Sync Controller
 * 
 * Handles LeetCode profile ingestion, 10-minute cooldown enforcement,
 * and bio token account verification.
 */

const crypto = require('crypto');
const { importFullUserStats, verifyBioToken } = require('../services/leetcodeService');
const { normalizeTopicMetrics } = require('../services/normalizerService');
const { supabase } = require('../config/supabase');

const COOLDOWN_MINUTES = 10;
const COOLDOWN_MS = COOLDOWN_MINUTES * 60 * 1000;

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

    // 3. Normalize Topic Competency for 8-Axis Radar
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
    };

    // 4. Save/Upsert into Supabase (if configured)
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

module.exports = {
  syncUserStats,
  generateVerificationToken,
  verifyUserToken,
};
