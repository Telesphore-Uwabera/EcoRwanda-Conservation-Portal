const express = require('express');
const router = express.Router();
const researcherDashboardController = require('../controllers/researcherDashboardController');

router.get('/', researcherDashboardController.getResearcherDashboardData);

module.exports = router; 