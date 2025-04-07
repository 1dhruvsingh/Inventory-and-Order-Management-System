// Customer routes
const express = require('express');
const router = express.Router();
const { 
  getCustomers, 
  getCustomerById, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer,
  getCustomerOrders 
} = require('../controllers/customerController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes
// GET /api/customers - Get all customers (protected)
// POST /api/customers - Create a new customer (protected)
router.route('/')
  .get(protect, getCustomers)
  .post(protect, createCustomer);

// GET /api/customers/:id - Get customer by ID (protected)
// PUT /api/customers/:id - Update customer (protected)
// DELETE /api/customers/:id - Delete customer (protected, admin only)
router.route('/:id')
  .get(protect, getCustomerById)
  .put(protect, updateCustomer)
  .delete(protect, admin, deleteCustomer);

// GET /api/customers/:id/orders - Get customer orders (protected)
router.route('/:id/orders')
  .get(protect, getCustomerOrders);

module.exports = router;