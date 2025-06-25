const express = require('express');
const router = express.Router();
const threatController = require('../controllers/threatController');
const { authenticateToken } = require('../middleware/auth');

// Get all threats (wildlife reports) for the authenticated user/ranger
router.get('/', authenticateToken, threatController.getThreats);

module.exports = router; 