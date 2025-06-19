const express = require('express');
const router = express.Router();
const { publishFinding } = require('../controllers/researchProjectController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/researchprojects/publish
router.post('/publish', authenticateToken, publishFinding);

module.exports = router; 