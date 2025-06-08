const express = require('express');
const router = express.Router();
const rangerDashboardController = require('../controllers/rangerDashboardController');

router.get('/', rangerDashboardController.getRangerDashboardData);

module.exports = router; 