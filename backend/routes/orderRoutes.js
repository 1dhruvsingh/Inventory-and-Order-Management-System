// Order routes
const express = require('express');
const router = express.Router();
const { 
  getOrders, 
  getOrderById, 
  createOrder, 
  updateOrderStatus, 
  deleteOrder,
  addOrderItem,
  updateOrderItem,
  removeOrderItem 
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Routes
// GET /api/orders - Get all orders (protected)
// POST /api/orders - Create a new order (protected)
router.route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

// GET /api/orders/:id - Get order by ID (protected)
// DELETE /api/orders/:id - Delete order (protected, admin only)
router.route('/:id')
  .get(protect, getOrderById)
  .delete(protect, admin, deleteOrder);

// PUT /api/orders/:id/status - Update order status (protected)
router.route('/:id/status')
  .put(protect, updateOrderStatus);

// POST /api/orders/:id/items - Add item to order (protected)
router.route('/:id/items')
  .post(protect, addOrderItem);

// PUT /api/orders/:id/items/:itemId - Update order item (protected)
// DELETE /api/orders/:id/items/:itemId - Remove item from order (protected)
router.route('/:id/items/:itemId')
  .put(protect, updateOrderItem)
  .delete(protect, removeOrderItem);

module.exports = router;