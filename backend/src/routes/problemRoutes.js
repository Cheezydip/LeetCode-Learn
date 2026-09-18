/**
 * Problem Routes
 * 
 * GET /api/problems          — All topic summaries (lightweight, no individual problems)
 * GET /api/problems/all      — Full catalog with all problems
 * GET /api/problems/:topicKey — All problems for a single topic (supports ?difficulty=Easy|Medium|Hard)
 */

const express = require('express');
const { getTopicSummaries, getTopicProblems, getCatalog } = require('../services/problemEnrichmentService');

const router = express.Router();

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
