// Supplier routes
const express = require('express');
const router = express.Router();
const { 
  getSuppliers, 
  getSupplierById, 
  createSupplier, 
  updateSupplier, 
  deleteSupplier,
  getSupplierProducts 
} = require('../controllers/supplierController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes
// GET /api/suppliers - Get all suppliers (protected)
// POST /api/suppliers - Create a new supplier (protected)
router.route('/')
  .get(protect, getSuppliers)
  .post(protect, createSupplier);

// GET /api/suppliers/:id - Get supplier by ID (protected)
// PUT /api/suppliers/:id - Update supplier (protected)
// DELETE /api/suppliers/:id - Delete supplier (protected, admin only)
router.route('/:id')
  .get(protect, getSupplierById)
  .put(protect, updateSupplier)
  .delete(protect, admin, deleteSupplier);

// GET /api/suppliers/:id/products - Get supplier products (protected)
router.route('/:id/products')
  .get(protect, getSupplierProducts);

module.exports = router;