const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getDashboardData } = require('../controllers/researcherDashboardController');

// @route   GET api/researcher-dashboard/
// @desc    Get all data for the main researcher dashboard
// @access  Private
router.get('/', authenticateToken, getDashboardData);

module.exports = router; 