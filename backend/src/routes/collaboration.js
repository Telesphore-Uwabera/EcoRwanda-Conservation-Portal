const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const collaborationController = require('../controllers/collaborationController');

router.get('/', authenticateToken, collaborationController.getThreads);
router.post('/', authenticateToken, collaborationController.createThread);
router.post('/:id/comment', authenticateToken, collaborationController.addComment);

module.exports = router; 