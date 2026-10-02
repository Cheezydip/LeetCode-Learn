/**
 * Problem Routes
 * 
 * GET /api/problems          — All topic summaries (lightweight, no individual problems)
 * GET /api/problems/all      — Full catalog with all problems
 * GET /api/problems/:topicKey — All problems for a single topic (supports ?difficulty=Easy|Medium|Hard)
 */

const express = require('express');
const { getTopicSummaries, getTopicProblems, getCatalog } = require('../services/problemEnrichmentService');
const { supabase } = require('../config/supabase');

const router = express.Router();

// In-memory cache for fast cloud sync responses
let cachedSyncData = null;
let lastSyncFetchTime = 0;
const SYNC_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Helper to paginate all problems from Supabase
 */
async function fetchAllProblemsFromSupabase() {
  const now = Date.now();
  if (cachedSyncData && now - lastSyncFetchTime < SYNC_CACHE_TTL_MS) {
    return cachedSyncData;
  }

  let allProblems = [];
  let from = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('problems')
      .select('frontend_id, title, title_slug, difficulty, category, ac_rate, leetcode_url, topic_tags, sheet_tags, company_tags, solutions, youtube, updated_at')
      .range(from, from + pageSize - 1)
      .order('frontend_id', { ascending: true, nullsFirst: false });

    if (error) {
      throw error;
    }
    if (!data || data.length === 0) break;
    allProblems = allProblems.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }

  cachedSyncData = allProblems;
  lastSyncFetchTime = now;
  return allProblems;
}

/**
 * GET /api/problems/version
 * Ultra-lightweight endpoint for client device cache invalidation check
 */
router.get('/version', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('problems')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    // Cache version identifier based on count and current deployment hash
    const version = `v1-${count || 3216}`;

    res.json({
      success: true,
      version,
      totalProblems: count || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Problems API] Error checking version:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve catalog version' });
  }
});

/**
 * GET /api/problems/cloud-sync
 * Returns complete problem catalog from Supabase for client IndexedDB caching
 */
router.get('/cloud-sync', async (req, res) => {
  try {
    const problems = await fetchAllProblemsFromSupabase();
    res.json({
      success: true,
      count: problems.length,
      version: `v1-${problems.length}`,
      syncedAt: new Date().toISOString(),
      problems,
    });
  } catch (err) {
    console.error('[Problems API] Error during cloud sync:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch catalog from cloud' });
  }
});

/**
 * GET /api/problems/sheet/:sheetKey
 * Query problems by curated sheet key directly from Supabase
 */
router.get('/sheet/:sheetKey', async (req, res) => {
  try {
    const { sheetKey } = req.params;
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .contains('sheet_tags', [sheetKey]);

    if (error) throw error;

    res.json({
      success: true,
      sheet: sheetKey,
      count: data?.length || 0,
      problems: data || [],
    });
  } catch (err) {
    console.error(`[Problems API] Error fetching sheet "${req.params.sheetKey}":`, err.message);
    res.status(500).json({ success: false, error: 'Failed to load sheet problems' });
  }
});

/**
 * GET /api/problems/company/:companySlug
 * Query problems asked by a specific tech company from Supabase
 */
router.get('/company/:companySlug', async (req, res) => {
  try {
    const { companySlug } = req.params;
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .contains('company_tags', [companySlug.toLowerCase()]);

    if (error) throw error;

    res.json({
      success: true,
      company: companySlug,
      count: data?.length || 0,
      problems: data || [],
    });
  } catch (err) {
    console.error(`[Problems API] Error fetching company "${req.params.companySlug}":`, err.message);
    res.status(500).json({ success: false, error: 'Failed to load company problems' });
  }
});

/**
 * GET /api/problems
 * Returns lightweight topic summaries (no individual problems)
 */
router.get('/', async (req, res) => {
  try {
    const summaries = await getTopicSummaries();
    res.json({
      success: true,
      topicCount: summaries.length,
      topics: summaries,
    });
  } catch (err) {
    console.error('[Problems API] Error fetching summaries:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load problem catalog' });
  }
});

/**
 * GET /api/problems/all
 * Returns full catalog with all problems (large response)
 */
router.get('/all', async (req, res) => {
  try {
    const catalog = await getCatalog();
    res.json({
      success: true,
      ...catalog,
    });
  } catch (err) {
    console.error('[Problems API] Error fetching full catalog:', err.message);
    res.status(500).json({ success: false, error: 'Failed to load full catalog' });
  }
});

/**
 * GET /api/problems/:topicKey
 * Returns all problems for a single topic
 * Query params: ?difficulty=Easy|Medium|Hard
 */
router.get('/:topicKey', async (req, res) => {
  try {
    const { topicKey } = req.params;
    const { difficulty } = req.query;

    // Validate difficulty if provided
    if (difficulty && !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty filter. Use: Easy, Medium, or Hard',
      });
    }

    const topic = await getTopicProblems(topicKey, difficulty || null);
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: `Topic "${topicKey}" not found`,
      });
    }

    res.json({
      success: true,
      ...topic,
    });
  } catch (err) {
    console.error(`[Problems API] Error fetching topic "${req.params.topicKey}":`, err.message);
    res.status(500).json({ success: false, error: 'Failed to load topic problems' });
  }
});

module.exports = router;
