// User routes
const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

// Import controller functions
// Since the controller doesn't exist yet, I'll define the expected functions
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
} = require('../controllers/userController');

// Routes
// POST /api/users/register - Register a new user
router.post('/register', registerUser);

// POST /api/users/login - Authenticate user & get token
router.post('/login', loginUser);

// GET /api/users/profile - Get user profile (protected)
// PUT /api/users/profile - Update user profile (protected)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// PUT /api/users/password - Change password (protected)
router.put('/password', protect, changePassword);

// GET /api/users - Get all users (admin only)
// POST /api/users - Create a new user (admin only)
router.route('/')
  .get(protect, admin, getUsers)
  .post(protect, admin, registerUser);

// GET /api/users/:id - Get user by ID (admin only)
// PUT /api/users/:id - Update user (admin only)
// DELETE /api/users/:id - Delete user (admin only)
router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;