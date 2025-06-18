const express = require('express');
const router = express.Router();
const { publishFinding, upload } = require('../controllers/researchProjectController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/researchprojects/publish
router.post('/publish', authenticateToken, upload.single('file'), publishFinding);

module.exports = router; 