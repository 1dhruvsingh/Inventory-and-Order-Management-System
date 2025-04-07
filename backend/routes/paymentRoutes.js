// Payment routes
const express = require('express');
const router = express.Router();
const { 
  getPayments, 
  getPaymentById, 
  createPayment, 
  updatePaymentStatus, 
  deletePayment,
  getPaymentsByOrderId 
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes
// GET /api/payments - Get all payments (protected)
// POST /api/payments - Create a new payment (protected)
router.route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

// GET /api/payments/:id - Get payment by ID (protected)
// DELETE /api/payments/:id - Delete payment (protected, admin only)
router.route('/:id')
  .get(protect, getPaymentById)
  .delete(protect, admin, deletePayment);

// PUT /api/payments/:id/status - Update payment status (protected)
router.route('/:id/status')
  .put(protect, updatePaymentStatus);

// GET /api/payments/order/:orderId - Get payments for an order (protected)
router.route('/order/:orderId')
  .get(protect, getPaymentsByOrderId);

module.exports = router;