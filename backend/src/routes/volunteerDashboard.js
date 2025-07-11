const express = require('express');
const router = express.Router();
const volunteerDashboardController = require('../controllers/volunteerDashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, volunteerDashboardController.getVolunteerDashboardData);

module.exports = router; 