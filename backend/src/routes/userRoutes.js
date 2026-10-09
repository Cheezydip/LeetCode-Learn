const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const userSyncController = require('../controllers/userSyncController');

// Rate limiter for external sync / token operations (20 requests per 15 min per IP)
const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many sync or verification requests. Please wait a few minutes before trying again.',
  },
});

// Rate limiter for problem status mutations (100 requests per 15 min per IP)
const mutateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many problem update requests. Please wait a few minutes before trying again.',
  },
});

// Sync user stats from LeetCode (enforces 10-minute cooldown)
router.post('/:handle/sync', syncLimiter, userSyncController.syncUserStats);

// Generate bio verification token
router.post('/:handle/generate-token', syncLimiter, userSyncController.generateVerificationToken);

// Verify bio token on LeetCode profile
router.post('/:handle/verify-token', syncLimiter, userSyncController.verifyUserToken);

// Option 1: Import solved problems via Browser Console Snippet
router.post('/:handle/import-solved', mutateLimiter, userSyncController.importSolvedProblems);

// Option 2: Import solved problems via 1-Time Session Cookie
router.post('/:handle/import-cookie-solved', syncLimiter, userSyncController.importCookieSolved);

// Get user solved problems list & topic breakdown
router.get('/:handle/solved', userSyncController.getUserSolvedProblems);

// Toggle a single problem solved / unsolved
router.post('/:handle/toggle-solved', mutateLimiter, userSyncController.toggleProblemSolved);

module.exports = router;
