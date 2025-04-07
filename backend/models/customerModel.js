// Customer model for database operations
const { pool } = require('../config/db');

/**
 * Customer model class for handling customer-related database operations
 */
class Customer {
  /**
   * Get all customers from the database
   * @param {Object} filters - Optional filters for customers
   * @returns {Promise<Array>} Array of customers
   */
  static async getAllCustomers(filters = {}) {
    try {
      let query = 'SELECT * FROM Customers WHERE 1=1';
      const queryParams = [];

      // Apply filters if provided
      if (filters.status) {
        query += ' AND status = ?';
        queryParams.push(filters.status);
      }

      // Add ordering
      query += ' ORDER BY customer_name ASC';

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting customers:', error.message);
      throw error;
    }
  }

  /**
   * Get customer by ID
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Customer object
   */
  static async getCustomerById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM Customers WHERE customer_id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error getting customer by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer object
   */
  static async createCustomer(customerData) {
    const {
      customer_name,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      status
    } = customerData;

    try {
      // Insert customer into database
      const [result] = await pool.query(
        `INSERT INTO Customers 
         (customer_name, email, phone, address, city, state, postal_code, country, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customer_name, email, phone, address, city, state, postal_code, country, status || 'active']
      );

      // Get created customer
      return await this.getCustomerById(result.insertId);
    } catch (error) {
      console.error('Error creating customer:', error.message);
      throw error;
    }
  }

  /**
   * Update customer
   * @param {number} id - Customer ID
   * @param {Object} customerData - Customer data to update
   * @returns {Promise<Object>} Updated customer object
   */
  static async updateCustomer(id, customerData) {
    const {
      customer_name,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      status
    } = customerData;

    try {
      // Update customer in database
      await pool.query(
        `UPDATE Customers SET 
         customer_name = ?, email = ?, phone = ?, address = ?, 
         city = ?, state = ?, postal_code = ?, country = ?, status = ? 
         WHERE customer_id = ?`,
        [customer_name, email, phone, address, city, state, postal_code, country, status, id]
      );

      // Get updated customer
      return await this.getCustomerById(id);
    } catch (error) {
      console.error('Error updating customer:', error.message);
      throw error;
    }
  }

  /**
   * Delete customer
   * @param {number} id - Customer ID
   * @returns {Promise<boolean>} True if customer was deleted
   */
  static async deleteCustomer(id) {
    try {
      // Check if customer has associated orders
      const [orderRows] = await pool.query('SELECT COUNT(*) as count FROM Orders WHERE customer_id = ?', [id]);
      if (orderRows[0].count > 0) {
        throw new Error('Cannot delete customer with associated orders');
      }

      const [result] = await pool.query('DELETE FROM Customers WHERE customer_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting customer:', error.message);
      throw error;
    }
  }

  /**
   * Get orders placed by a customer
   * @param {number} id - Customer ID
   * @returns {Promise<Array>} Array of orders
   */
  static async getCustomerOrders(id) {
    try {
      const [rows] = await pool.query(
        `SELECT o.*, u.username as created_by 
         FROM Orders o 
         JOIN Users u ON o.user_id = u.user_id 
         WHERE o.customer_id = ? 
         ORDER BY o.order_date DESC`,
        [id]
      );
      return rows;
    } catch (error) {
      console.error('Error getting customer orders:', error.message);
      throw error;
    }
  }

  /**
   * Search customers
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching customers
   */
  static async searchCustomers(searchTerm) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM Customers 
         WHERE customer_name LIKE ? OR email LIKE ? OR phone LIKE ? 
         ORDER BY customer_name ASC`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error searching customers:', error.message);
      throw error;
    }
  }
}

module.exports = Customer;