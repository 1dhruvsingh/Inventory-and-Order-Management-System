// Product model for database operations
const { pool } = require('../config/db');

/**
 * Product model class for handling product-related database operations
 */
class Product {
  /**
   * Get all products from the database
   * @param {Object} filters - Optional filters for products
   * @returns {Promise<Array>} Array of products
   */
  static async getAllProducts(filters = {}) {
    try {
      let query = `
        SELECT p.*, s.supplier_name 
        FROM Products p
        LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
        WHERE 1=1
      `;
      const queryParams = [];

      // Apply filters if provided
      if (filters.category) {
        query += ' AND p.category = ?';
        queryParams.push(filters.category);
      }

      if (filters.supplier_id) {
        query += ' AND p.supplier_id = ?';
        queryParams.push(filters.supplier_id);
      }

      if (filters.status) {
        query += ' AND p.status = ?';
        queryParams.push(filters.status);
      }

      if (filters.low_stock) {
        query += ' AND p.stock_quantity <= p.reorder_level';
      }

      // Add ordering
      query += ' ORDER BY p.product_name ASC';

      const [rows] = await pool.query(query, queryParams);
      return rows;
    } catch (error) {
      console.error('Error getting products:', error.message);
      throw error;
    }
  }

  /**
   * Get product by ID
   * @param {number} id - Product ID
   * @returns {Promise<Object>} Product object
   */
  static async getProductById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, s.supplier_name 
         FROM Products p
         LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
         WHERE p.product_id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting product by ID:', error.message);
      throw error;
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product object
   */
  static async createProduct(productData) {
    const {
      product_name,
      description,
      category,
      unit_price,
      stock_quantity,
      reorder_level,
      supplier_id,
      sku,
      image_url,
      status
    } = productData;

    try {
      // Insert product into database
      const [result] = await pool.query(
        `INSERT INTO Products 
         (product_name, description, category, unit_price, stock_quantity, reorder_level, supplier_id, sku, image_url, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [product_name, description, category, unit_price, stock_quantity, reorder_level, supplier_id, sku, image_url, status || 'active']
      );

      // Get created product
      return await this.getProductById(result.insertId);
    } catch (error) {
      console.error('Error creating product:', error.message);
      throw error;
    }
  }

  /**
   * Update product
   * @param {number} id - Product ID
   * @param {Object} productData - Product data to update
   * @returns {Promise<Object>} Updated product object
   */
  static async updateProduct(id, productData) {
    const {
      product_name,
      description,
      category,
      unit_price,
      stock_quantity,
      reorder_level,
      supplier_id,
      sku,
      image_url,
      status
    } = productData;

    try {
      // Update product in database
      await pool.query(
        `UPDATE Products SET 
         product_name = ?, description = ?, category = ?, unit_price = ?, 
         stock_quantity = ?, reorder_level = ?, supplier_id = ?, sku = ?, 
         image_url = ?, status = ? 
         WHERE product_id = ?`,
        [product_name, description, category, unit_price, stock_quantity, reorder_level, supplier_id, sku, image_url, status, id]
      );

      // Get updated product
      return await this.getProductById(id);
    } catch (error) {
      console.error('Error updating product:', error.message);
      throw error;
    }
  }

  /**
   * Delete product
   * @param {number} id - Product ID
   * @returns {Promise<boolean>} True if product was deleted
   */
  static async deleteProduct(id) {
    try {
      const [result] = await pool.query('DELETE FROM Products WHERE product_id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting product:', error.message);
      throw error;
    }
  }

  /**
   * Update product stock
   * @param {number} id - Product ID
   * @param {number} quantity - Quantity to add (positive) or remove (negative)
   * @param {number} userId - User ID making the change
   * @param {string} changeType - Type of stock change (purchase, sale, adjustment, return)
   * @param {number} referenceId - Reference ID (e.g., order_id)
   * @param {string} notes - Notes about the stock change
   * @returns {Promise<Object>} Updated product object
   */
  static async updateStock(id, quantity, userId, changeType, referenceId = null, notes = '') {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get current product stock
      const [productRows] = await connection.query(
        'SELECT product_id, stock_quantity FROM Products WHERE product_id = ?',
        [id]
      );
      
      if (!productRows[0]) {
        throw new Error('Product not found');
      }
      
      const product = productRows[0];
      const previousQuantity = product.stock_quantity;
      const newQuantity = previousQuantity + quantity;
      
      // Update product stock
      await connection.query(
        'UPDATE Products SET stock_quantity = ? WHERE product_id = ?',
        [newQuantity, id]
      );
      
      // Log stock change
      await connection.query(
        `INSERT INTO StockLogs 
         (product_id, user_id, change_quantity, previous_quantity, new_quantity, change_type, reference_id, notes) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, quantity, previousQuantity, newQuantity, changeType, referenceId, notes]
      );
      
      // Check if stock is below reorder level and create notification if needed
      const [productInfo] = await connection.query(
        'SELECT product_name, stock_quantity, reorder_level FROM Products WHERE product_id = ?',
        [id]
      );
      
      if (productInfo[0] && productInfo[0].stock_quantity <= productInfo[0].reorder_level) {
        await connection.query(
          `INSERT INTO Notifications 
           (user_id, title, message, type, reference_id) 
           VALUES (NULL, ?, ?, 'low_stock', ?)`,
          [
            'Low Stock Alert',
            `${productInfo[0].product_name} is below reorder level (${productInfo[0].stock_quantity} remaining)`,
            id
          ]
        );
      }
      
      await connection.commit();
      
      // Get updated product
      return await this.getProductById(id);
    } catch (error) {
      await connection.rollback();
      console.error('Error updating stock:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get product categories
   * @returns {Promise<Array>} Array of unique categories
   */
  static async getCategories() {
    try {
      const [rows] = await pool.query('SELECT DISTINCT category FROM Products ORDER BY category');
      return rows.map(row => row.category);
    } catch (error) {
      console.error('Error getting categories:', error.message);
      throw error;
    }
  }

  /**
   * Search products
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching products
   */
  static async searchProducts(searchTerm) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, s.supplier_name 
         FROM Products p
         LEFT JOIN Suppliers s ON p.supplier_id = s.supplier_id
         WHERE p.product_name LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR p.category LIKE ?
         ORDER BY p.product_name ASC`,
        [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
      );
      return rows;
    } catch (error) {
      console.error('Error searching products:', error.message);
      throw error;
    }
  }
}

module.exports = Product;