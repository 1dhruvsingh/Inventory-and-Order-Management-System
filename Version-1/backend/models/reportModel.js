// Report model for database operations
const { pool } = require('../config/db');

/**
 * Report model class for handling report-related database operations
 */
class Report {
  /**
   * Get all reports from the database
   * @param {Object} filters - Optional filters for reports
   * @returns {Promise<Array>} Array of reports
   */
  static async getAllReports(filters = {}) {
    try {
      let query = `
        SELECT r.*, u.username as generated_by 
        FROM Reports r
        JOIN Users u ON r.user_id = u.user_id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters if provided
      if (filters.user_id) {
        query += ' AND r.user_id = ?';
        queryParams.push(filters.user_id);
      }

      if (filters.report_type) {
        query += ' AND r.report_type = ?';
        queryParams.push(filters.report_type);
      }

      if (filters.start_date && filters.end_date) {
        query += ' AND r.created_at BETWEEN ? AND ?';
        queryParams.push(filters.start_date, filters.end_date);
      }

      // Add ordering
      query += ' ORDER BY r.created_at DESC';

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting reports:', error.message);
      throw error;
    }
  }

  /**
   * Get report by ID
   * @param {number} id - Report ID
   * @returns {Promise<Object>} Report object
   */
  static async getReportById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT r.*, u.username as generated_by 
         FROM Reports r
         JOIN Users u ON r.user_id = u.user_id
         WHERE r.report_id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting report by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new report
   * @param {Object} reportData - Report data
   * @returns {Promise<Object>} Created report object
   */
  static async createReport(reportData) {
    const {
      user_id,
      report_name,
      report_type,
      parameters,
      result_data
    } = reportData;

    try {
      // Insert report into database
      const [result] = await pool.query(
        `INSERT INTO Reports 
         (user_id, report_name, report_type, parameters, result_data) 
         VALUES (?, ?, ?, ?, ?)`,
        [user_id, report_name, report_type, parameters, result_data]
      );

      // Get created report
      return await this.getReportById(result.insertId);
    } catch (error) {
      console.error('Error creating report:', error.message);
      throw error;
    }
  }

  /**
   * Delete report
   * @param {number} id - Report ID
   * @returns {Promise<boolean>} True if report was deleted
   */
  static async deleteReport(id) {
    try {
      const [result] = await pool.query('DELETE FROM Reports WHERE report_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting report:', error.message);
      throw error;
    }
  }

  /**
   * Generate sales report
   * @param {number} userId - User ID generating the report
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Generated report
   */
  static async generateSalesReport(userId, params) {
    const { start_date, end_date, customer_id, product_id } = params;
    
    try {
      let query = `
        SELECT 
          o.order_id,
          o.order_date,
          c.customer_name,
          o.total_amount,
          o.status,
          COUNT(od.order_detail_id) as total_items,
          p.status as payment_status
        FROM Orders o
        JOIN Customers c ON o.customer_id = c.customer_id
        JOIN OrderDetails od ON o.order_id = od.order_id
        LEFT JOIN (
          SELECT order_id, status
          FROM Payments
          WHERE status = 'completed'
        ) p ON o.order_id = p.order_id
        WHERE o.order_date BETWEEN ? AND ?
      `;
      const queryParams = [start_date, end_date];
      
      if (customer_id) {
        query += ' AND o.customer_id = ?';
        queryParams.push(customer_id);
      }
      
      if (product_id) {
        query += ' AND EXISTS (SELECT 1 FROM OrderDetails od2 WHERE od2.order_id = o.order_id AND od2.product_id = ?)';
        queryParams.push(product_id);
      }
      
      query += ' GROUP BY o.order_id ORDER BY o.order_date DESC';
      
      const [orderRows] = await pool.query(query, queryParams);
      
      // Get total sales and statistics
      const [statsRows] = await pool.query(
        `SELECT 
          COUNT(DISTINCT o.order_id) as total_orders,
          SUM(o.total_amount) as total_revenue,
          AVG(o.total_amount) as average_order_value,
          COUNT(DISTINCT o.customer_id) as unique_customers
        FROM Orders o
        WHERE o.order_date BETWEEN ? AND ?`,
        [start_date, end_date]
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
        WHERE o.order_date BETWEEN ? AND ?
        GROUP BY p.product_id
        ORDER BY total_quantity DESC
        LIMIT 5`,
        [start_date, end_date]
      );
      
      // Prepare report data
      const reportData = {
        orders: orderRows,
        statistics: statsRows[0],
        top_products: productRows,
        parameters: params
      };
      
      // Create report in database
      const report = await this.createReport({
        user_id: userId,
        report_name: `Sales Report (${start_date} to ${end_date})`,
        report_type: 'sales',
        parameters: JSON.stringify(params),
        result_data: JSON.stringify(reportData)
      });
      
      return report;
    } catch (error) {
      console.error('Error generating sales report:', error.message);
      throw error;
    }
  }

  /**
   * Generate inventory report
   * @param {number} userId - User ID generating the report
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Generated report
   */
  static async generateInventoryReport(userId, params) {
    const { category, low_stock_only, supplier_id } = params;
    
    try {
      let query = `
        SELECT 
          p.*,
          s.supplier_name,
          (SELECT SUM(change_quantity) FROM StockLogs WHERE product_id = p.product_id AND change_type = 'sale') as total_sold,
          (SELECT COUNT(*) FROM OrderDetails od JOIN Orders o ON od.order_id = o.order_id WHERE od.product_id = p.product_id) as order_count
        FROM Products p
        LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
        WHERE 1=1
      `;
      const queryParams = [];
      
      if (category) {
        query += ' AND p.category = ?';
        queryParams.push(category);
      }
      
      if (low_stock_only) {
        query += ' AND p.stock_quantity <= p.reorder_level';
      }
      
      if (supplier_id) {
        query += ' AND p.supplier_id = ?';
        queryParams.push(supplier_id);
      }
      
      query += ' ORDER BY p.category, p.product_name';
      
      const [productRows] = await pool.query(query, queryParams);
      
      // Get inventory statistics
      const [statsRows] = await pool.query(
        `SELECT 
          COUNT(*) as total_products,
          SUM(CASE WHEN stock_quantity <= reorder_level THEN 1 ELSE 0 END) as low_stock_count,
          SUM(stock_quantity * unit_price) as total_inventory_value,
          AVG(stock_quantity) as average_stock_level
        FROM Products`
      );
      
      // Get stock by category
      const [categoryRows] = await pool.query(
        `SELECT 
          category,
          COUNT(*) as product_count,
          SUM(stock_quantity) as total_stock,
          SUM(stock_quantity * unit_price) as category_value
        FROM Products
        GROUP BY category
        ORDER BY category`
      );
      
      // Prepare report data
      const reportData = {
        products: productRows,
        statistics: statsRows[0],
        categories: categoryRows,
        parameters: params
      };
      
      // Create report in database
      const report = await this.createReport({
        user_id: userId,
        report_name: `Inventory Report ${new Date().toISOString().split('T')[0]}`,
        report_type: 'inventory',
        parameters: JSON.stringify(params),
        result_data: JSON.stringify(reportData)
      });
      
      return report;
    } catch (error) {
      console.error('Error generating inventory report:', error.message);
      throw error;
    }
  }

  /**
   * Generate customer report
   * @param {number} userId - User ID generating the report
   * @param {Object} params - Report parameters
   * @returns {Promise<Object>} Generated report
   */
  static async generateCustomerReport(userId, params) {
    const { customer_id, start_date, end_date } = params;
    
    try {
      // Get customer information
      const [customerRows] = await pool.query(
        'SELECT * FROM Customers WHERE customer_id = ?',
        [customer_id]
      );
      
      if (!customerRows[0]) {
        throw new Error('Customer not found');
      }
      
      // Get customer orders
      let query = `
        SELECT 
          o.*,
          (SELECT COUNT(*) FROM OrderDetails WHERE order_id = o.order_id) as item_count,
          (SELECT status FROM Payments WHERE order_id = o.order_id AND status = 'completed' LIMIT 1) as payment_status
        FROM Orders o
        WHERE o.customer_id = ?
      `;
      const queryParams = [customer_id];
      
      if (start_date && end_date) {
        query += ' AND o.order_date BETWEEN ? AND ?';
        queryParams.push(start_date, end_date);
      }
      
      query += ' ORDER BY o.order_date DESC';
      
      const [orderRows] = await pool.query(query, queryParams);
      
      // Get customer statistics
      const [statsRows] = await pool.query(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_spent,
          AVG(total_amount) as average_order_value,
          MIN(order_date) as first_order_date,
          MAX(order_date) as last_order_date
        FROM Orders
        WHERE customer_id = ?`,
        [customer_id]
      );
      
      // Get most purchased products
      const [productRows] = await pool.query(
        `SELECT 
          p.product_id,
          p.product_name,
          SUM(od.quantity) as total_quantity,
          SUM(od.subtotal) as total_spent
        FROM OrderDetails od
        JOIN Products p ON od.product_id = p.product_id
        JOIN Orders o ON od.order_id = o.order_id
        WHERE o.customer_id = ?
        GROUP BY p.product_id
        ORDER BY total_quantity DESC
        LIMIT 5`,
        [customer_id]
      );
      
      // Prepare report data
      const reportData = {
        customer: customerRows[0],
        orders: orderRows,
        statistics: statsRows[0],
        top_products: productRows,
        parameters: params
      };
      
      // Create report in database
      const report = await this.createReport({
        user_id: userId,
        report_name: `Customer Report - ${customerRows[0].customer_name}`,
        report_type: 'customer',
        parameters: JSON.stringify(params),
        result_data: JSON.stringify(reportData)
      });
      
      return report;
    } catch (error) {
      console.error('Error generating customer report:', error.message);
      throw error;
    }
  }
}

module.exports = Report;