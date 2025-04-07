// Notification routes
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import controller functions
const {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// Routes
// GET /api/notifications - Get all notifications for current user (protected)
// POST /api/notifications - Create a new notification (protected)
router.route('/')
  .get(protect, getNotifications)
  .post(protect, createNotification);

// GET /api/notifications/:id - Get notification by ID (protected)
// DELETE /api/notifications/:id - Delete notification (protected)
router.route('/:id')
  .get(protect, getNotificationById)
  .delete(protect, deleteNotification);

// PUT /api/notifications/:id/read - Mark notification as read (protected)
router.route('/:id/read')
  .put(protect, markAsRead);

// PUT /api/notifications/read-all - Mark all notifications as read (protected)
router.route('/read-all')
  .put(protect, markAllAsRead);

module.exports = router;