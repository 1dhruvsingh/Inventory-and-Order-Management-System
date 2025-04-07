// Notification model for database operations
const { pool } = require('../config/db');

/**
 * Notification model class for handling notification-related database operations
 */
class Notification {
  /**
   * Get all notifications from the database
   * @param {Object} filters - Optional filters for notifications
   * @returns {Promise<Array>} Array of notifications
   */
  static async getAllNotifications(filters = {}) {
    try {
      let query = `
        SELECT n.*, u.username 
        FROM Notifications n
        LEFT JOIN Users u ON n.user_id = u.user_id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters if provided
      if (filters.user_id) {
        query += ' AND (n.user_id = ? OR n.user_id IS NULL)';
        queryParams.push(filters.user_id);
      }

      if (filters.type) {
        query += ' AND n.type = ?';
        queryParams.push(filters.type);
      }

      if (filters.is_read !== undefined) {
        query += ' AND n.is_read = ?';
        queryParams.push(filters.is_read);
      }

      // Add ordering
      query += ' ORDER BY n.created_at DESC';

      // Add limit if specified
      if (filters.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(filters.limit));
      }

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting notifications:', error.message);
      throw error;
    }
  }

  /**
   * Get notification by ID
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} Notification object
   */
  static async getNotificationById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT n.*, u.username 
         FROM Notifications n
         LEFT JOIN Users u ON n.user_id = u.user_id
         WHERE n.notification_id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting notification by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification object
   */
  static async createNotification(notificationData) {
    const {
      user_id,
      title,
      message,
      type,
      reference_id
    } = notificationData;

    try {
      // Insert notification into database
      const [result] = await pool.query(
        `INSERT INTO Notifications 
         (user_id, title, message, type, reference_id) 
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, title, message, type, reference_id]
      );

      // Get created notification
      return await this.getNotificationById(result.insertId);
    } catch (error) {
      console.error('Error creating notification:', error.message);
      throw error;
    }
  }

  /**
   * Mark notification as read
   * @param {number} id - Notification ID
   * @returns {Promise<Object>} Updated notification object
   */
  static async markAsRead(id) {
    try {
      await pool.query(
        'UPDATE Notifications SET is_read = TRUE WHERE notification_id = ?',
        [id]
      );

      // Get updated notification
      return await this.getNotificationById(id);
    } catch (error) {
      console.error('Error marking notification as read:', error.message);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if notifications were marked as read
   */
  static async markAllAsRead(userId) {
    try {
      const [result] = await pool.query(
        'UPDATE Notifications SET is_read = TRUE WHERE user_id = ? OR user_id IS NULL',
        [userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking all notifications as read:', error.message);
      throw error;
    }
  }

  /**
   * Delete notification
   * @param {number} id - Notification ID
   * @returns {Promise<boolean>} True if notification was deleted
   */
  static async deleteNotification(id) {
    try {
      const [result] = await pool.query('DELETE FROM Notifications WHERE notification_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting notification:', error.message);
      throw error;
    }
  }

  /**
   * Delete all read notifications
   * @returns {Promise<boolean>} True if notifications were deleted
   */
  static async deleteAllRead() {
    try {
      const [result] = await pool.query('DELETE FROM Notifications WHERE is_read = TRUE');
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting read notifications:', error.message);
      throw error;
    }
  }

  /**
   * Get unread notification count for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Count of unread notifications
   */
  static async getUnreadCount(userId) {
    try {
      const [rows] = await pool.query(
        'SELECT COUNT(*) as count FROM Notifications WHERE (user_id = ? OR user_id IS NULL) AND is_read = FALSE',
        [userId]
      );
      return rows[0].count;
    } catch (error) {
      console.error('Error getting unread notification count:', error.message);
      throw error;
    }
  }
}

module.exports = Notification;