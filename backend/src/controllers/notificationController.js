const Notification = require('../models/Notification');
const User = require('../models/User');
const { getWebSocketService } = require('../services/websocketService');

// Get notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }

    await notification.remove();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a notification
exports.createNotification = async (req, res) => {
  try {
    const { recipient, title, message, type, link } = req.body;

    const notification = new Notification({
      recipient,
      title,
      message,
      type,
      link,
    });

    await notification.save();

    // Send real-time notification if the recipient is online
    const wsService = getWebSocketService();
    if (wsService) {
      wsService.sendNotification(recipient, notification);
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create multiple notifications
exports.createMultipleNotifications = async (recipients, title, message, type, link) => {
  try {
    const notifications = recipients.map(recipient => ({
      recipient,
      title,
      message,
      type,
      link,
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // Send real-time notifications to online users
    const wsService = getWebSocketService();
    if (wsService) {
      wsService.broadcastNotification(recipients, {
        title,
        message,
        type,
        link,
      });
    }

    return createdNotifications;
  } catch (error) {
    console.error('Error creating multiple notifications:', error);
    throw error;
  }
}; 