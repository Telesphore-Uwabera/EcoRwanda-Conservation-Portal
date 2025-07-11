const express = require('express');
const router = express.Router();
const { getRecentActivities } = require('../controllers/activityController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// @route   GET /api/activities
// @desc    Get recent activities for the admin dashboard
// @access  Private (Admin)
router.get('/', authenticateToken, isAdmin, getRecentActivities);

module.exports = router; 