const express = require('express');
const router = express.Router();
const userSyncController = require('../controllers/userSyncController');

// Sync user stats from LeetCode (enforces 10-minute cooldown)
router.post('/:handle/sync', userSyncController.syncUserStats);

// Generate bio verification token
router.post('/:handle/generate-token', userSyncController.generateVerificationToken);

// Verify bio token on LeetCode profile
router.post('/:handle/verify-token', userSyncController.verifyUserToken);

// Option 1: Import solved problems via Browser Console Snippet
router.post('/:handle/import-solved', userSyncController.importSolvedProblems);

// Option 2: Import solved problems via 1-Time Session Cookie
router.post('/:handle/import-cookie-solved', userSyncController.importCookieSolved);

// Get user solved problems list & topic breakdown
router.get('/:handle/solved', userSyncController.getUserSolvedProblems);

// Toggle a single problem solved / unsolved
router.post('/:handle/toggle-solved', userSyncController.toggleProblemSolved);

module.exports = router;
