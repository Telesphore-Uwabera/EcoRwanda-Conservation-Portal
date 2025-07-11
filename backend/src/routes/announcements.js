const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const announcementController = require('../controllers/announcementController');

router.get('/', authenticateToken, announcementController.getAnnouncements);
router.post('/', authenticateToken, announcementController.createAnnouncement);
router.delete('/:id', authenticateToken, announcementController.deleteAnnouncement);

module.exports = router; 