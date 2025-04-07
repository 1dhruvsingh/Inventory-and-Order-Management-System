// User controller for handling user-related requests
const User = require('../models/userModel');

/**
 * Register a new user
 * @route POST /api/users/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { username, password, email, full_name, role, phone } = req.body;

    // Basic validation
    if (!username || !password || !email || !full_name) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const [existingUsers] = await User.getAllUsers();
    const userExists = existingUsers.find(user => user.username === username || user.email === email);

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const userData = {
      username,
      password,
      email,
      full_name,
      role: role || 'staff', // Default to staff if not specified
      phone
    };

    const user = await User.createUser(userData);

    // Return user without token for simplified authentication
    res.status(201).json({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    });
  } catch (error) {
    console.error('Error in registerUser:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Authenticate user & get token
 * @route POST /api/users/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Basic validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // For demonstration purposes, simplified login without complex JWT validation
    // Get user from database
    const [rows] = await User.getUserByUsername(username);
    const user = rows[0];

    // Simple password check (for demonstration only)
    if (user && password === user.password) {
      // Update last login
      await User.updateLastLogin(user.user_id);

      // Return user data
      res.status(200).json({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error('Error in loginUser:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user profile
 * @route GET /api/users/profile
 * @access Private
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      username: req.body.username || user.username,
      email: req.body.email || user.email,
      full_name: req.body.full_name || user.full_name,
      role: user.role, // Don't allow changing role through profile update
      phone: req.body.phone || user.phone,
      status: user.status
    };

    const updatedUser = await User.updateUser(req.user.id, userData);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error in updateUserProfile:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Change password
 * @route PUT /api/users/password
 * @access Private
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide current and new password' });
    }

    const success = await User.changePassword(req.user.id, currentPassword, newPassword);

    if (success) {
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(400).json({ message: 'Current password is incorrect' });
    }
  } catch (error) {
    console.error('Error in changePassword:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get all users
 * @route GET /api/users
 * @access Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error in getUsers:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = {
      username: req.body.username || user.username,
      email: req.body.email || user.email,
      full_name: req.body.full_name || user.full_name,
      role: req.body.role || user.role,
      phone: req.body.phone || user.phone,
      status: req.body.status || user.status
    };

    const updatedUser = await User.updateUser(req.params.id, userData);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error in updateUser:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const deleted = await User.deleteUser(req.params.id);

    if (deleted) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete user' });
    }
  } catch (error) {
    console.error('Error in deleteUser:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword
};