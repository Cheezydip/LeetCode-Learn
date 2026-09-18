const express = require('express');
const router = express.Router();
const userSyncController = require('../controllers/userSyncController');

// Sync user stats from LeetCode (enforces 10-minute cooldown)
router.post('/:handle/sync', userSyncController.syncUserStats);

// Generate bio verification token
router.post('/:handle/generate-token', userSyncController.generateVerificationToken);

// Verify bio token on LeetCode profile
router.post('/:handle/verify-token', userSyncController.verifyUserToken);

module.exports = router;
