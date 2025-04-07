// Payment model for database operations
const { pool } = require('../config/db');

/**
 * Payment model class for handling payment-related database operations
 */
class Payment {
  /**
   * Get all payments from the database
   * @param {Object} filters - Optional filters for payments
   * @returns {Promise<Array>} Array of payments
   */
  static async getAllPayments(filters = {}) {
    try {
      let query = `
        SELECT p.*, o.order_id, o.total_amount as order_total, c.customer_name 
        FROM Payments p
        JOIN Orders o ON p.order_id = o.order_id
        JOIN Customers c ON o.customer_id = c.customer_id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters if provided
      if (filters.status) {
        query += ' AND p.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.payment_method) {
        query += ' AND p.payment_method = ?';
        queryParams.push(filters.payment_method);
      }

      if (filters.order_id) {
        query += ' AND p.order_id = ?';
        queryParams.push(filters.order_id);
      }

      if (filters.start_date && filters.end_date) {
        query += ' AND p.payment_date BETWEEN ? AND ?';
        queryParams.push(filters.start_date, filters.end_date);
      }

      // Add ordering
      query += ' ORDER BY p.payment_date DESC';

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting payments:', error.message);
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Payment object
   */
  static async getPaymentById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, o.order_id, o.total_amount as order_total, c.customer_name 
         FROM Payments p
         JOIN Orders o ON p.order_id = o.order_id
         JOIN Customers c ON o.customer_id = c.customer_id
         WHERE p.payment_id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting payment by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Created payment object
   */
  static async createPayment(paymentData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        order_id,
        amount,
        payment_method,
        transaction_id,
        status,
        notes
      } = paymentData;
      
      // Insert payment into database
      const [result] = await connection.query(
        `INSERT INTO Payments 
         (order_id, amount, payment_method, transaction_id, status, notes) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [order_id, amount, payment_method, transaction_id, status || 'pending', notes]
      );
      
      const paymentId = result.insertId;
      
      // If payment is completed, update order status if it's pending
      if (status === 'completed') {
        const [orderRows] = await connection.query(
          'SELECT status FROM Orders WHERE order_id = ?',
          [order_id]
        );
        
        if (orderRows[0] && orderRows[0].status === 'pending') {
          await connection.query(
            'UPDATE Orders SET status = ? WHERE order_id = ?',
            ['processing', order_id]
          );
        }
      }
      
      // Create notification for payment
      await connection.query(
        `INSERT INTO Notifications 
         (user_id, title, message, type, reference_id) 
         VALUES (NULL, ?, ?, 'payment', ?)`,
        [
          'Payment Received',
          `Payment of $${amount} has been ${status} for Order #${order_id}`,
          order_id
        ]
      );
      
      await connection.commit();
      
      // Get created payment
      return await this.getPaymentById(paymentId);
    } catch (error) {
      await connection.rollback();
      console.error('Error creating payment:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update payment status
   * @param {number} id - Payment ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated payment object
   */
  static async updatePaymentStatus(id, status) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Get payment information
      const [paymentRows] = await connection.query(
        'SELECT * FROM Payments WHERE payment_id = ?',
        [id]
      );
      
      if (!paymentRows[0]) {
        throw new Error('Payment not found');
      }
      
      const payment = paymentRows[0];
      
      // Update payment status
      await connection.query(
        'UPDATE Payments SET status = ? WHERE payment_id = ?',
        [status, id]
      );
      
      // If payment is completed, update order status if it's pending
      if (status === 'completed') {
        const [orderRows] = await connection.query(
          'SELECT status FROM Orders WHERE order_id = ?',
          [payment.order_id]
        );
        
        if (orderRows[0] && orderRows[0].status === 'pending') {
          await connection.query(
            'UPDATE Orders SET status = ? WHERE order_id = ?',
            ['processing', payment.order_id]
          );
        }
      }
      
      // Create notification for payment status update
      await connection.query(
        `INSERT INTO Notifications 
         (user_id, title, message, type, reference_id) 
         VALUES (NULL, ?, ?, 'payment', ?)`,
        [
          'Payment Status Update',
          `Payment status for Order #${payment.order_id} has been updated to ${status}`,
          payment.order_id
        ]
      );
      
      await connection.commit();
      
      // Get updated payment
      return await this.getPaymentById(id);
    } catch (error) {
      await connection.rollback();
      console.error('Error updating payment status:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete payment
   * @param {number} id - Payment ID
   * @returns {Promise<boolean>} True if payment was deleted
   */
  static async deletePayment(id) {
    try {
      const [result] = await pool.query('DELETE FROM Payments WHERE payment_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting payment:', error.message);
      throw error;
    }
  }

  /**
   * Get payments for an order
   * @param {number} orderId - Order ID
   * @returns {Promise<Array>} Array of payments
   */
  static async getPaymentsByOrderId(orderId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM Payments WHERE order_id = ? ORDER BY payment_date DESC',
        [orderId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting payments by order ID:', error.message);
      throw error;
    }
  }

  /**
   * Get payment statistics
   * @param {string} period - Period for statistics (today, week, month, year)
   * @returns {Promise<Object>} Payment statistics
   */
  static async getPaymentStatistics(period = 'month') {
    try {
      let dateFilter;
      
      switch (period) {
        case 'today':
          dateFilter = 'DATE(payment_date) = CURDATE()';
          break;
        case 'week':
          dateFilter = 'YEARWEEK(payment_date) = YEARWEEK(CURDATE())';
          break;
        case 'month':
          dateFilter = 'YEAR(payment_date) = YEAR(CURDATE()) AND MONTH(payment_date) = MONTH(CURDATE())';
          break;
        case 'year':
          dateFilter = 'YEAR(payment_date) = YEAR(CURDATE())';
          break;
        default:
          dateFilter = 'YEAR(payment_date) = YEAR(CURDATE()) AND MONTH(payment_date) = MONTH(CURDATE())';
      }
      
      // Get total payments and amount
      const [totalRows] = await pool.query(
        `SELECT 
          COUNT(*) as total_payments, 
          SUM(amount) as total_amount 
         FROM Payments 
         WHERE ${dateFilter} AND status = 'completed'`
      );
      
      // Get payments by method
      const [methodRows] = await pool.query(
        `SELECT 
          payment_method, 
          COUNT(*) as count, 
          SUM(amount) as total_amount 
         FROM Payments 
         WHERE ${dateFilter} AND status = 'completed' 
         GROUP BY payment_method`
      );
      
      // Get payments by status
      const [statusRows] = await pool.query(
        `SELECT 
          status, 
          COUNT(*) as count, 
          SUM(amount) as total_amount 
         FROM Payments 
         WHERE ${dateFilter} 
         GROUP BY status`
      );
      
      return {
        total_payments: totalRows[0].total_payments || 0,
        total_amount: totalRows[0].total_amount || 0,
        payments_by_method: methodRows,
        payments_by_status: statusRows
      };
    } catch (error) {
      console.error('Error getting payment statistics:', error.message);
      throw error;
    }
  }
}

module.exports = Payment;