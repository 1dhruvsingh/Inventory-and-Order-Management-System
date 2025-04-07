// Supplier model for database operations
const { pool } = require('../config/db');

/**
 * Supplier model class for handling supplier-related database operations
 */
class Supplier {
  /**
   * Get all suppliers from the database
   * @param {Object} filters - Optional filters for suppliers
   * @returns {Promise<Array>} Array of suppliers
   */
  static async getAllSuppliers(filters = {}) {
    try {
      let query = 'SELECT * FROM Suppliers WHERE 1=1';
      const queryParams = [];

      // Apply filters if provided
      if (filters.status) {
        query += ' AND status = ?';
        queryParams.push(filters.status);
      }

      // Add ordering
      query += ' ORDER BY supplier_name ASC';

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting suppliers:', error.message);
      throw error;
    }
  }

  /**
   * Get supplier by ID
   * @param {number} id - Supplier ID
   * @returns {Promise<Object>} Supplier object
   */
  static async getSupplierById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM Suppliers WHERE supplier_id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error getting supplier by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new supplier
   * @param {Object} supplierData - Supplier data
   * @returns {Promise<Object>} Created supplier object
   */
  static async createSupplier(supplierData) {
    const {
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      status
    } = supplierData;

    try {
      // Insert supplier into database
      const [result] = await pool.query(
        `INSERT INTO Suppliers 
         (supplier_name, contact_person, email, phone, address, city, state, postal_code, country, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [supplier_name, contact_person, email, phone, address, city, state, postal_code, country, status || 'active']
      );

      // Get created supplier
      return await this.getSupplierById(result.insertId);
    } catch (error) {
      console.error('Error creating supplier:', error.message);
      throw error;
    }
  }

  /**
   * Update supplier
   * @param {number} id - Supplier ID
   * @param {Object} supplierData - Supplier data to update
   * @returns {Promise<Object>} Updated supplier object
   */
  static async updateSupplier(id, supplierData) {
    const {
      supplier_name,
      contact_person,
      email,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      status
    } = supplierData;

    try {
      // Update supplier in database
      await pool.query(
        `UPDATE Suppliers SET 
         supplier_name = ?, contact_person = ?, email = ?, phone = ?, 
         address = ?, city = ?, state = ?, postal_code = ?, country = ?, status = ? 
         WHERE supplier_id = ?`,
        [supplier_name, contact_person, email, phone, address, city, state, postal_code, country, status, id]
      );

      // Get updated supplier
      return await this.getSupplierById(id);
    } catch (error) {
      console.error('Error updating supplier:', error.message);
      throw error;
    }
  }

  /**
   * Delete supplier
   * @param {number} id - Supplier ID
   * @returns {Promise<boolean>} True if supplier was deleted
   */
  static async deleteSupplier(id) {
    try {
      // Check if supplier has associated products
      const [productRows] = await pool.query('SELECT COUNT(*) as count FROM Products WHERE supplier_id = ?', [id]);
      if (productRows[0].count > 0) {
        throw new Error('Cannot delete supplier with associated products');
      }

      const [result] = await pool.query('DELETE FROM Suppliers WHERE supplier_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting supplier:', error.message);
      throw error;
    }
  }

  /**
   * Get products supplied by a supplier
   * @param {number} id - Supplier ID
   * @returns {Promise<Array>} Array of products
   */
  static async getSupplierProducts(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM Products WHERE supplier_id = ? ORDER BY product_name ASC',
        [id]
      );
      return rows;
    } catch (error) {
      console.error('Error getting supplier products:', error.message);
      throw error;
    }
  }

  /**
   * Search suppliers
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching suppliers
   */
  static async searchSuppliers(searchTerm) {
    try {
      const [rows] = await pool.query(
        `SELECT * FROM Suppliers 
         WHERE supplier_name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR phone LIKE ? 
         ORDER BY supplier_name ASC`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error searching suppliers:', error.message);
      throw error;
    }
  }
}

module.exports = Supplier;