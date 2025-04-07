// Report routes
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import controller functions
const {
  getReports,
  getReportById,
  generateReport,
  deleteReport
} = require('../controllers/reportController');

// Routes
// GET /api/reports - Get all reports (protected)
// POST /api/reports - Generate a new report (protected)
router.route('/')
  .get(protect, getReports)
  .post(protect, generateReport);

// GET /api/reports/:id - Get report by ID (protected)
// DELETE /api/reports/:id - Delete report (protected)
router.route('/:id')
  .get(protect, getReportById)
  .delete(protect, deleteReport);

module.exports = router;