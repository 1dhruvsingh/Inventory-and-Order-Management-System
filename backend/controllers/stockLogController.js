// Stock Log controller for handling inventory tracking
const StockLog = require('../models/stockLogModel');
const Product = require('../models/productModel');

/**
 * Get all stock logs
 * @route GET /api/stocklogs
 * @access Private
 */
const getStockLogs = async (req, res) => {
  try {
    const filters = {
      product_id: req.query.product_id,
      user_id: req.query.user_id,
      change_type: req.query.change_type,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const stockLogs = await StockLog.getAllStockLogs(filters);
    res.status(200).json(stockLogs);
  } catch (error) {
    console.error('Error in getStockLogs:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get stock log by ID
 * @route GET /api/stocklogs/:id
 * @access Private
 */
const getStockLogById = async (req, res) => {
  try {
    const stockLog = await StockLog.getStockLogById(req.params.id);
    
    if (!stockLog) {
      return res.status(404).json({ message: 'Stock log not found' });
    }
    
    res.status(200).json(stockLog);
  } catch (error) {
    console.error('Error in getStockLogById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get stock logs for a product
 * @route GET /api/stocklogs/product/:productId
 * @access Private
 */
const getProductStockLogs = async (req, res) => {
  try {
    const stockLogs = await StockLog.getStockLogsByProduct(req.params.productId);
    res.status(200).json(stockLogs);
  } catch (error) {
    console.error('Error in getProductStockLogs:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new stock log
 * @route POST /api/stocklogs
 * @access Private
 */
const createStockLog = async (req, res) => {
  try {
    const { product_id, change_quantity, change_type, reference_id, notes } = req.body;
    const user_id = req.user.id; // From auth middleware
    
    if (!product_id || !change_quantity || !change_type) {
      return res.status(400).json({ 
        message: 'Please provide product ID, change quantity, and change type' 
      });
    }
    
    // Get current product stock
    const product = await Product.getProductById(product_id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const previous_quantity = product.stock_quantity;
    const new_quantity = previous_quantity + parseInt(change_quantity);
    
    if (new_quantity < 0) {
      return res.status(400).json({ 
        message: 'Insufficient stock. Cannot reduce below zero.' 
      });
    }
    
    // Create stock log
    const stockLogData = {
      product_id,
      user_id,
      change_quantity: parseInt(change_quantity),
      previous_quantity,
      new_quantity,
      change_type,
      reference_id,
      notes
    };
    
    const stockLog = await StockLog.createStockLog(stockLogData);
    
    // Update product stock
    await Product.updateStock(
      product_id,
      parseInt(change_quantity),
      user_id,
      change_type,
      reference_id,
      notes
    );
    
    res.status(201).json(stockLog);
  } catch (error) {
    console.error('Error in createStockLog:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete stock log
 * @route DELETE /api/stocklogs/:id
 * @access Private/Admin
 */
const deleteStockLog = async (req, res) => {
  try {
    const stockLog = await StockLog.getStockLogById(req.params.id);
    
    if (!stockLog) {
      return res.status(404).json({ message: 'Stock log not found' });
    }
    
    // Note: Deleting a stock log doesn't revert the stock change
    // That would require a new stock log entry with the opposite change
    const deleted = await StockLog.deleteStockLog(req.params.id);
    
    if (deleted) {
      res.status(200).json({ message: 'Stock log deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete stock log' });
    }
  } catch (error) {
    console.error('Error in deleteStockLog:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getStockLogs,
  getStockLogById,
  getProductStockLogs,
  createStockLog,
  deleteStockLog
};