// Order model for database operations
const { pool } = require('../config/db');

/**
 * Order model class for handling order-related database operations
 */
class Order {
  /**
   * Get all orders from the database
   * @param {Object} filters - Optional filters for orders
   * @returns {Promise<Array>} Array of orders
   */
  static async getAllOrders(filters = {}) {
    try {
      let query = `
        SELECT o.*, c.customer_name, u.username as created_by 
        FROM Orders o
        JOIN Customers c ON o.customer_id = c.customer_id
        JOIN Users u ON o.user_id = u.user_id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters if provided
      if (filters.status) {
        query += ' AND o.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.customer_id) {
        query += ' AND o.customer_id = ?';
        queryParams.push(filters.customer_id);
      }

      if (filters.start_date && filters.end_date) {
        query += ' AND o.order_date BETWEEN ? AND ?';
        queryParams.push(filters.start_date, filters.end_date);
      }

      // Add ordering
      query += ' ORDER BY o.order_date DESC';

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting orders:', error.message);
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param {number} id - Order ID
   * @returns {Promise<Object>} Order object with details
   */
  static async getOrderById(id) {
    const connection = await pool.getConnection();
    
    try {
      // Get order information
      const [orderRows] = await connection.query(
        `SELECT o.*, c.customer_name, u.username as created_by 
         FROM Orders o
         JOIN Customers c ON o.customer_id = c.customer_id
         JOIN Users u ON o.user_id = u.user_id
         WHERE o.order_id = ?`,
        [id]
      );
      
      if (!orderRows[0]) {
        return null;
      }
      
      const order = orderRows[0];
      
      // Get order details
      const [detailRows] = await connection.query(
        `SELECT od.*, p.product_name, p.sku 
         FROM OrderDetails od
         JOIN Products p ON od.product_id = p.product_id
         WHERE od.order_id = ?`,
        [id]
      );
      
      // Get payment information
      const [paymentRows] = await connection.query(
        'SELECT * FROM Payments WHERE order_id = ?',
        [id]
      );
      
      // Combine all information
      order.details = detailRows;
      order.payments = paymentRows;
      
      return order;
    } catch (error) {
      console.error('Error getting order by ID:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Create a new order
   * @param {Object} orderData - Order data
   * @param {Array} orderDetails - Order details (products)
   * @returns {Promise<Object>} Created order object
   */
  static async createOrder(orderData, orderDetails) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const {
        customer_id,
        user_id,
        total_amount,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_postal_code,
        shipping_country,
        notes
      } = orderData;
      
      // Insert order into database
      const [orderResult] = await connection.query(
        `INSERT INTO Orders 
         (customer_id, user_id, total_amount, shipping_address, shipping_city, 
          shipping_state, shipping_postal_code, shipping_country, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customer_id, user_id, total_amount, shipping_address, shipping_city, 
         shipping_state, shipping_postal_code, shipping_country, notes]
      );
      
      const orderId = orderResult.insertId;
      
      // Insert order details
      for (const detail of orderDetails) {
        const { product_id, quantity, unit_price, subtotal, discount } = detail;
        
        await connection.query(
          `INSERT INTO OrderDetails 
           (order_id, product_id, quantity, unit_price, subtotal, discount) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [orderId, product_id, quantity, unit_price, subtotal, discount || 0]
        );
        
        // Update product stock
        await connection.query(
          'UPDATE Products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
          [quantity, product_id]
        );
        
        // Log stock change
        const [productRows] = await connection.query(
          'SELECT stock_quantity FROM Products WHERE product_id = ?',
          [product_id]
        );
        
        await connection.query(
          `INSERT INTO StockLogs 
           (product_id, user_id, change_quantity, previous_quantity, new_quantity, change_type, reference_id, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product_id,
            user_id,
            -quantity,
            productRows[0].stock_quantity + quantity,
            productRows[0].stock_quantity,
            'sale',
            orderId,
            `Order #${orderId}`
          ]
        );
        
        // Check if product is below reorder level and create notification if needed
        const [productInfo] = await connection.query(
          'SELECT product_name, stock_quantity, reorder_level FROM Products WHERE product_id = ?',
          [product_id]
        );
        
        if (productInfo[0] && productInfo[0].stock_quantity <= productInfo[0].reorder_level) {
          await connection.query(
            `INSERT INTO Notifications 
             (user_id, title, message, type, reference_id) 
             VALUES (NULL, ?, ?, 'low_stock', ?)`,
            [
              'Low Stock Alert',
              `${productInfo[0].product_name} is below reorder level (${productInfo[0].stock_quantity} remaining)`,
              product_id
            ]
          );
        }
      }
      
      // Create notification for new order
      await connection.query(
        `INSERT INTO Notifications 
         (user_id, title, message, type, reference_id) 
         VALUES (NULL, ?, ?, 'order_status', ?)`,
        [
          'New Order Placed',
          `Order #${orderId} has been placed and needs processing`,
          orderId
        ]
      );
      
      await connection.commit();
      
      // Get created order
      return await this.getOrderById(orderId);
    } catch (error) {
      await connection.rollback();
      console.error('Error creating order:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Update order status
   * @param {number} id - Order ID
   * @param {string} status - New status
   * @param {number} userId - User ID making the change
   * @returns {Promise<Object>} Updated order object
   */
  static async updateOrderStatus(id, status, userId) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Update order status
      await connection.query(
        'UPDATE Orders SET status = ? WHERE order_id = ?',
        [status, id]
      );
      
      // Create notification for status change
      await connection.query(
        `INSERT INTO Notifications 
         (user_id, title, message, type, reference_id) 
         VALUES (NULL, ?, ?, 'order_status', ?)`,
        [
          'Order Status Update',
          `Order #${id} status has been updated to ${status}`,
          id
        ]
      );
      
      await connection.commit();
      
      // Get updated order
      return await this.getOrderById(id);
    } catch (error) {
      await connection.rollback();
      console.error('Error updating order status:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Delete order
   * @param {number} id - Order ID
   * @returns {Promise<boolean>} True if order was deleted
   */
  static async deleteOrder(id) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Delete order details
      await connection.query('DELETE FROM OrderDetails WHERE order_id = ?', [id]);
      
      // Delete payments
      await connection.query('DELETE FROM Payments WHERE order_id = ?', [id]);
      
      // Delete notifications related to this order
      await connection.query(
        "DELETE FROM Notifications WHERE type = 'order_status' AND reference_id = ?",
        [id]
      );
      
      // Delete order
      const [result] = await connection.query('DELETE FROM Orders WHERE order_id = ?', [id]);
      
      await connection.commit();
      
      return result.affectedRows > 0;
    } catch (error) {
      await connection.rollback();
      console.error('Error deleting order:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get order statistics
   * @param {string} period - Period for statistics (today, week, month, year)
   * @returns {Promise<Object>} Order statistics
   */
  static async getOrderStatistics(period = 'month') {
    try {
      let dateFilter;
      
      switch (period) {
        case 'today':
          dateFilter = 'DATE(order_date) = CURDATE()';
          break;
        case 'week':
          dateFilter = 'YEARWEEK(order_date) = YEARWEEK(CURDATE())';
          break;
        case 'month':
          dateFilter = 'YEAR(order_date) = YEAR(CURDATE()) AND MONTH(order_date) = MONTH(CURDATE())';
          break;
        case 'year':
          dateFilter = 'YEAR(order_date) = YEAR(CURDATE())';
          break;
        default:
          dateFilter = 'YEAR(order_date) = YEAR(CURDATE()) AND MONTH(order_date) = MONTH(CURDATE())';
      }
      
      // Get total orders and revenue
      const [totalRows] = await pool.query(
        `SELECT 
          COUNT(*) as total_orders, 
          SUM(total_amount) as total_revenue 
         FROM Orders 
         WHERE ${dateFilter}`
      );
      
      // Get orders by status
      const [statusRows] = await pool.query(
        `SELECT 
          status, 
          COUNT(*) as count 
         FROM Orders 
         WHERE ${dateFilter} 
         GROUP BY status`
      );
      
      // Get top selling products
      const [productRows] = await pool.query(
        `SELECT 
          p.product_id, 
          p.product_name, 
          SUM(od.quantity) as total_quantity, 
          SUM(od.subtotal) as total_revenue 
         FROM OrderDetails od 
         JOIN Products p ON od.product_id = p.product_id 
         JOIN Orders o ON od.order_id = o.order_id 
         WHERE ${dateFilter} 
         GROUP BY p.product_id 
         ORDER BY total_quantity DESC 
         LIMIT 5`
      );
      
      return {
        total_orders: totalRows[0].total_orders || 0,
        total_revenue: totalRows[0].total_revenue || 0,
        orders_by_status: statusRows,
        top_products: productRows
      };
    } catch (error) {
      console.error('Error getting order statistics:', error.message);
      throw error;
    }
  }
}

module.exports = Order;