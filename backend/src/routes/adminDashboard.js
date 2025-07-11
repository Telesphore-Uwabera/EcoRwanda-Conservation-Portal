const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Get admin dashboard statistics
router.get('/stats', authenticateToken, isAdmin, adminDashboardController.getDashboardStats);

module.exports = router; 