const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

router.get('/', authenticateToken, chatController.getMessages);
router.post('/', authenticateToken, chatController.postMessage);
router.post('/:id/like', authenticateToken, chatController.likeMessage);
router.post('/:id/unlike', authenticateToken, chatController.unlikeMessage);
router.post('/:id/reply', authenticateToken, chatController.replyMessage);
router.put('/:id', authenticateToken, chatController.editMessage);
router.delete('/:id', authenticateToken, chatController.deleteMessage);

module.exports = router; 