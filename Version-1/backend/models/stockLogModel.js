// StockLog model for database operations
const { pool } = require('../config/db');

/**
 * StockLog model class for handling stock log-related database operations
 */
class StockLog {
  /**
   * Get all stock logs from the database
   * @param {Object} filters - Optional filters for stock logs
   * @returns {Promise<Array>} Array of stock logs
   */
  static async getAllStockLogs(filters = {}) {
    try {
      let query = `
        SELECT sl.*, p.product_name, u.username 
        FROM StockLogs sl
        JOIN Products p ON sl.product_id = p.product_id
        JOIN Users u ON sl.user_id = u.user_id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters if provided
      if (filters.product_id) {
        query += ' AND sl.product_id = ?';
        queryParams.push(filters.product_id);
      }

      if (filters.user_id) {
        query += ' AND sl.user_id = ?';
        queryParams.push(filters.user_id);
      }

      if (filters.change_type) {
        query += ' AND sl.change_type = ?';
        queryParams.push(filters.change_type);
      }

      if (filters.start_date && filters.end_date) {
        query += ' AND sl.log_date BETWEEN ? AND ?';
        queryParams.push(filters.start_date, filters.end_date);
      }

      // Add ordering
      query += ' ORDER BY sl.log_date DESC';

      // Add limit if specified
      if (filters.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(filters.limit));
      }

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting stock logs:', error.message);
      throw error;
    }
  }

  /**
   * Get stock log by ID
   * @param {number} id - Stock log ID
   * @returns {Promise<Object>} Stock log object
   */
  static async getStockLogById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT sl.*, p.product_name, u.username 
         FROM StockLogs sl
         JOIN Products p ON sl.product_id = p.product_id
         JOIN Users u ON sl.user_id = u.user_id
         WHERE sl.log_id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting stock log by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new stock log
   * @param {Object} stockLogData - Stock log data
   * @returns {Promise<Object>} Created stock log object
   */
  static async createStockLog(stockLogData) {
    const {
      product_id,
      user_id,
      change_quantity,
      previous_quantity,
      new_quantity,
      change_type,
      reference_id,
      notes
    } = stockLogData;

    try {
      // Insert stock log into database
      const [result] = await pool.query(
        `INSERT INTO StockLogs 
         (product_id, user_id, change_quantity, previous_quantity, new_quantity, change_type, reference_id, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [product_id, user_id, change_quantity, previous_quantity, new_quantity, change_type, reference_id, notes]
      );

      // Get created stock log
      return await this.getStockLogById(result.insertId);
    } catch (error) {
      console.error('Error creating stock log:', error.message);
      throw error;
    }
  }

  /**
   * Get stock logs for a product
   * @param {number} productId - Product ID
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of stock logs
   */
  static async getStockLogsByProductId(productId, filters = {}) {
    try {
      let query = `
        SELECT sl.*, u.username 
        FROM StockLogs sl
        JOIN Users u ON sl.user_id = u.user_id
        WHERE sl.product_id = ?
      `;
      const queryParams = [productId];

      // Apply filters if provided
      if (filters.change_type) {
        query += ' AND sl.change_type = ?';
        queryParams.push(filters.change_type);
      }

      if (filters.start_date && filters.end_date) {
        query += ' AND sl.log_date BETWEEN ? AND ?';
        queryParams.push(filters.start_date, filters.end_date);
      }

      // Add ordering
      query += ' ORDER BY sl.log_date DESC';

      // Add limit if specified
      if (filters.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(filters.limit));
      }

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting stock logs by product ID:', error.message);
      throw error;
    }
  }

  /**
   * Get stock movement summary for a period
   * @param {string} period - Period for summary (today, week, month, year)
   * @returns {Promise<Object>} Stock movement summary
   */
  static async getStockMovementSummary(period = 'month') {
    try {
      let dateFilter;
      
      switch (period) {
        case 'today':
          dateFilter = 'DATE(log_date) = CURDATE()';
          break;
        case 'week':
          dateFilter = 'YEARWEEK(log_date) = YEARWEEK(CURDATE())';
          break;
        case 'month':
          dateFilter = 'YEAR(log_date) = YEAR(CURDATE()) AND MONTH(log_date) = MONTH(CURDATE())';
          break;
        case 'year':
          dateFilter = 'YEAR(log_date) = YEAR(CURDATE())';
          break;
        default:
          dateFilter = 'YEAR(log_date) = YEAR(CURDATE()) AND MONTH(log_date) = MONTH(CURDATE())';
      }
      
      // Get stock movement by type
      const [typeRows] = await pool.query(
        `SELECT 
          change_type, 
          SUM(CASE WHEN change_quantity > 0 THEN change_quantity ELSE 0 END) as additions,
          SUM(CASE WHEN change_quantity < 0 THEN ABS(change_quantity) ELSE 0 END) as reductions,
          COUNT(*) as count 
         FROM StockLogs 
         WHERE ${dateFilter} 
         GROUP BY change_type`
      );
      
      // Get most active products
      const [productRows] = await pool.query(
        `SELECT 
          p.product_id, 
          p.product_name, 
          COUNT(sl.log_id) as movement_count,
          SUM(ABS(sl.change_quantity)) as total_movement 
         FROM StockLogs sl 
         JOIN Products p ON sl.product_id = p.product_id 
         WHERE ${dateFilter} 
         GROUP BY p.product_id 
         ORDER BY total_movement DESC 
         LIMIT 5`
      );
      
      // Get most active users
      const [userRows] = await pool.query(
        `SELECT 
          u.user_id, 
          u.username, 
          COUNT(sl.log_id) as action_count 
         FROM StockLogs sl 
         JOIN Users u ON sl.user_id = u.user_id 
         WHERE ${dateFilter} 
         GROUP BY u.user_id 
         ORDER BY action_count DESC 
         LIMIT 5`
      );
      
      return {
        by_type: typeRows,
        active_products: productRows,
        active_users: userRows
      };
    } catch (error) {
      console.error('Error getting stock movement summary:', error.message);
      throw error;
    }
  }
}

module.exports = StockLog;