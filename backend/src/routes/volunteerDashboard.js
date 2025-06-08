const express = require('express');
const router = express.Router();
const volunteerDashboardController = require('../controllers/volunteerDashboardController');

router.get('/', volunteerDashboardController.getVolunteerDashboardData);

module.exports = router; 