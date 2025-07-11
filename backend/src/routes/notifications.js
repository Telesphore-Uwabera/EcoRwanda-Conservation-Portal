const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

// Get all notifications for the authenticated user
router.get('/', authenticate, notificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', authenticate, notificationController.getUnreadCount);

// Mark a notification as read
router.put('/:id/read', authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', authenticate, notificationController.markAllAsRead);

// Delete a notification
router.delete('/:id', authenticate, notificationController.deleteNotification);

// Create a notification (admin only)
router.post('/', authenticate, notificationController.createNotification);

module.exports = router; 