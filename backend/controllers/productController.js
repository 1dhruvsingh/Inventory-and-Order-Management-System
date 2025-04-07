// Product controller for handling product-related requests
const Product = require('../models/productModel');

/**
 * Get all products
 * @route GET /api/products
 * @access Public
 */
const getProducts = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      supplier_id: req.query.supplier_id,
      status: req.query.status,
      low_stock: req.query.low_stock === 'true'
    };

    const products = await Product.getAllProducts(filters);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error in getProducts:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get product by ID
 * @route GET /api/products/:id
 * @access Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error in getProductById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new product
 * @route POST /api/products
 * @access Private
 */
const createProduct = async (req, res) => {
  try {
    // Basic validation
    const { product_name, unit_price, stock_quantity } = req.body;
    
    if (!product_name || !unit_price) {
      return res.status(400).json({ message: 'Please provide product name and price' });
    }
    
    const productData = {
      product_name,
      description: req.body.description,
      category: req.body.category,
      unit_price,
      stock_quantity: stock_quantity || 0,
      reorder_level: req.body.reorder_level,
      supplier_id: req.body.supplier_id,
      sku: req.body.sku,
      image_url: req.body.image_url,
      status: req.body.status
    };
    
    const product = await Product.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error in createProduct:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update product
 * @route PUT /api/products/:id
 * @access Private
 */
const updateProduct = async (req, res) => {
  try {
    const productExists = await Product.getProductById(req.params.id);
    
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const productData = {
      product_name: req.body.product_name,
      description: req.body.description,
      category: req.body.category,
      unit_price: req.body.unit_price,
      stock_quantity: req.body.stock_quantity,
      reorder_level: req.body.reorder_level,
      supplier_id: req.body.supplier_id,
      sku: req.body.sku,
      image_url: req.body.image_url,
      status: req.body.status
    };
    
    const product = await Product.updateProduct(req.params.id, productData);
    res.status(200).json(product);
  } catch (error) {
    console.error('Error in updateProduct:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete product
 * @route DELETE /api/products/:id
 * @access Private
 */
const deleteProduct = async (req, res) => {
  try {
    const productExists = await Product.getProductById(req.params.id);
    
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const deleted = await Product.deleteProduct(req.params.id);
    
    if (deleted) {
      res.status(200).json({ message: 'Product deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete product' });
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update product stock
 * @route PUT /api/products/:id/stock
 * @access Private
 */
const updateProductStock = async (req, res) => {
  try {
    const { quantity, change_type, reference_id, notes } = req.body;
    const userId = req.user.id; // From auth middleware
    
    if (!quantity || !change_type) {
      return res.status(400).json({ message: 'Please provide quantity and change type' });
    }
    
    const product = await Product.updateStock(
      req.params.id,
      parseInt(quantity),
      userId,
      change_type,
      reference_id,
      notes
    );
    
    res.status(200).json(product);
  } catch (error) {
    console.error('Error in updateProductStock:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock
};