const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

// Get progress list or progress by problem
router.get('/', progressController.getProgress);

// Save or update progress
router.post('/', progressController.updateProgress);

// Delete progress record
router.delete('/:id', progressController.deleteProgress);

module.exports = router;
