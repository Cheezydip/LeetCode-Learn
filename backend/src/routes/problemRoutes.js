const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

// List problems & search/filter
router.get('/', problemController.getAllProblems);

// Get specific problem
router.get('/:id', problemController.getProblemById);

// Add new problem
router.post('/', problemController.createProblem);

// Update problem
router.put('/:id', problemController.updateProblem);

// Delete problem
router.delete('/:id', problemController.deleteProblem);

module.exports = router;
