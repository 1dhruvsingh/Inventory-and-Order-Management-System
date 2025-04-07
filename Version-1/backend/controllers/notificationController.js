// Notification controller for handling system alerts
const Notification = require('../models/notificationModel');

/**
 * Get all notifications for current user
 * @route GET /api/notifications
 * @access Private
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      is_read: req.query.is_read === 'true' ? true : (req.query.is_read === 'false' ? false : null),
      type: req.query.type
    };

    // Get user-specific notifications and system-wide notifications
    const notifications = await Notification.getUserNotifications(userId, filters);
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error in getNotifications:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get notification by ID
 * @route GET /api/notifications/:id
 * @access Private
 */
const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.getNotificationById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to user or is system-wide
    if (notification.user_id !== null && notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this notification' });
    }
    
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error in getNotificationById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new notification
 * @route POST /api/notifications
 * @access Private
 */
const createNotification = async (req, res) => {
  try {
    const { title, message, type, reference_id, user_id } = req.body;
    
    if (!title || !message || !type) {
      return res.status(400).json({ message: 'Please provide title, message, and type' });
    }
    
    const notificationData = {
      user_id: user_id || null, // null for system-wide notifications
      title,
      message,
      type,
      reference_id: reference_id || null,
      is_read: false
    };
    
    const notification = await Notification.createNotification(notificationData);
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error in createNotification:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Mark notification as read
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.getNotificationById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to user or is system-wide
    if (notification.user_id !== null && notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this notification' });
    }
    
    const updated = await Notification.markAsRead(req.params.id);
    
    if (updated) {
      res.status(200).json({ message: 'Notification marked as read' });
    } else {
      res.status(400).json({ message: 'Failed to update notification' });
    }
  } catch (error) {
    console.error('Error in markAsRead:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const updated = await Notification.markAllAsRead(userId);
    
    if (updated) {
      res.status(200).json({ message: 'All notifications marked as read' });
    } else {
      res.status(400).json({ message: 'Failed to update notifications' });
    }
  } catch (error) {
    console.error('Error in markAllAsRead:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete notification
 * @route DELETE /api/notifications/:id
 * @access Private
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.getNotificationById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Check if notification belongs to user or is system-wide
    if (notification.user_id !== null && notification.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this notification' });
    }
    
    const deleted = await Notification.deleteNotification(req.params.id);
    
    if (deleted) {
      res.status(200).json({ message: 'Notification deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete notification' });
    }
  } catch (error) {
    console.error('Error in deleteNotification:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
};