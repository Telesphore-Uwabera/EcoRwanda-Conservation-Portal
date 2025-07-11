const express = require('express');
const router = express.Router();
const rangerDashboardController = require('../controllers/rangerDashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, rangerDashboardController.getRangerDashboardData);

module.exports = router; 