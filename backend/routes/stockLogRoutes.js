// Stock Log routes
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import controller functions
// Since the controller doesn't exist yet, I'll define the expected functions
const {
  getStockLogs,
  getStockLogById,
  getProductStockLogs,
  createStockLog,
  deleteStockLog
} = require('../controllers/stockLogController');

// Routes
// GET /api/stocklogs - Get all stock logs (protected)
// POST /api/stocklogs - Create a new stock log (protected)
router.route('/')
  .get(protect, getStockLogs)
  .post(protect, createStockLog);

// GET /api/stocklogs/:id - Get stock log by ID (protected)
// DELETE /api/stocklogs/:id - Delete stock log (protected, admin only)
router.route('/:id')
  .get(protect, getStockLogById)
  .delete(protect, admin, deleteStockLog);

// GET /api/stocklogs/product/:productId - Get stock logs for a product (protected)
router.route('/product/:productId')
  .get(protect, getProductStockLogs);

module.exports = router;