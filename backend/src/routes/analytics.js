const express = require('express');
const router = express.Router();
const { getAnalytics, getDetailedAnalytics } = require('../controllers/analyticsController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get overall analytics (admin only)
router.get('/', authenticateToken, isAdmin, getAnalytics);

// Get detailed analytics for specific metrics (admin only)
router.get('/detailed', authenticateToken, isAdmin, getDetailedAnalytics);

module.exports = router; 