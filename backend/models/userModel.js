// User model for database operations
const { pool } = require('../config/db');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');

/**
 * User model class for handling user-related database operations
 */
class User {
  /**
   * Get all users from the database
   * @returns {Promise<Array>} Array of users
   */
  static async getAllUsers() {
    try {
      const [rows] = await pool.query(
        'SELECT user_id, username, email, full_name, role, phone, created_at, last_login, status FROM Users'
      );
      return rows;
    } catch (error) {
      console.error('Error getting users:', error.message);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object>} User object
   */
  static async getUserById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT user_id, username, email, full_name, role, phone, created_at, last_login, status FROM Users WHERE user_id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting user by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  static async createUser(userData) {
    const { username, password, email, full_name, role, phone } = userData;

    try {
      // For demonstration, store password as plain text
      // In a real application, ALWAYS hash passwords

      // Insert user into database
      const [result] = await pool.query(
        'INSERT INTO Users (username, password, email, full_name, role, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [username, password, email, full_name, role, phone]
      );

      // Get created user
      const [rows] = await pool.query(
        'SELECT user_id, username, email, full_name, role, phone, created_at, status FROM Users WHERE user_id = ?',
        [result.insertId]
      );

      return rows[0];
    } catch (error) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  }

  /**
   * Update user
   * @param {number} id - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user object
   */
  static async updateUser(id, userData) {
    const { username, email, full_name, role, phone, status } = userData;

    try {
      // Update user in database
      await pool.query(
        'UPDATE Users SET username = ?, email = ?, full_name = ?, role = ?, phone = ?, status = ? WHERE user_id = ?',
        [username, email, full_name, role, phone, status, id]
      );

      // Get updated user
      const [rows] = await pool.query(
        'SELECT user_id, username, email, full_name, role, phone, created_at, last_login, status FROM Users WHERE user_id = ?',
        [id]
      );

      return rows[0];
    } catch (error) {
      console.error('Error updating user:', error.message);
      throw error;
    }
  }

  /**
   * Delete user
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if user was deleted
   */
  static async deleteUser(id) {
    try {
      const [result] = await pool.query('DELETE FROM Users WHERE user_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error.message);
      throw error;
    }
  }

  /**
   * Get user by username
   * @param {string} username - Username
   * @returns {Promise<Array>} User rows
   */
  static async getUserByUsername(username) {
    try {
      return await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
    } catch (error) {
      console.error('Error getting user by username:', error.message);
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if updated successfully
   */
  static async updateLastLogin(id) {
    try {
      const [result] = await pool.query('UPDATE Users SET last_login = NOW() WHERE user_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating last login:', error.message);
      throw error;
    }
  }

  /**
   * Authenticate user (simplified for demonstration)
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} User object
   */
  static async login(username, password) {
    try {
      // Get user from database
      const [rows] = await pool.query('SELECT * FROM Users WHERE username = ?', [username]);
      const user = rows[0];

      // For demonstration, simplified password check
      if (user && password === user.password) {
        // Update last login
        await pool.query('UPDATE Users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

        // Return user without token
        return {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error logging in:', error.message);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {number} id - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} True if password was changed
   */
  static async changePassword(id, currentPassword, newPassword) {
    try {
      // Get user from database
      const [rows] = await pool.query('SELECT * FROM Users WHERE user_id = ?', [id]);
      const user = rows[0];

      // Check if current password is correct
      if (user && (await comparePassword(currentPassword, user.password))) {
        // Hash new password
        const hashedPassword = await hashPassword(newPassword);

        // Update password
        await pool.query('UPDATE Users SET password = ? WHERE user_id = ?', [hashedPassword, id]);

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error changing password:', error.message);
      throw error;
    }
  }
}

module.exports = User;