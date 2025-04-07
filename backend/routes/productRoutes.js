// Product routes
const express = require('express');
const router = express.Router();
const { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  updateProductStock 
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes
// GET /api/products - Get all products
// POST /api/products - Create a new product (protected)
router.route('/')
  .get(getProducts)
  .post(protect, createProduct);

// GET /api/products/:id - Get product by ID
// PUT /api/products/:id - Update product (protected)
// DELETE /api/products/:id - Delete product (protected)
router.route('/:id')
  .get(getProductById)
  .put(protect, updateProduct)
  .delete(protect, admin, deleteProduct);

// PUT /api/products/:id/stock - Update product stock (protected)
router.route('/:id/stock')
  .put(protect, updateProductStock);

module.exports = router;