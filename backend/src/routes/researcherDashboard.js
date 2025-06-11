const express = require('express');
const router = express.Router();
const researcherDashboardController = require('../controllers/researcherDashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, researcherDashboardController.getResearcherDashboardData);

module.exports = router; 