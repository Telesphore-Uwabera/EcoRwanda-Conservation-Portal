const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const researcherDashboardController = require('../controllers/researcherDashboardController');

// @route   GET api/researcher-dashboard
// @desc    Get data for researcher dashboard
// @access  Private
router.get('/', authenticateToken, researcherDashboardController.getDashboardData);

module.exports = router; 