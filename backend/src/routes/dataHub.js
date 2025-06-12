const express = require('express');
const router = express.Router();
const dataHubController = require('../controllers/dataHubController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, dataHubController.getDataHubData);

module.exports = router; 