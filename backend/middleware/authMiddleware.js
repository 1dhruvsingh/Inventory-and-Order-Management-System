// Simplified authentication middleware for demonstration purposes

// Simplified middleware that always authorizes requests
// In a real application, NEVER use this approach
const protect = async (req, res, next) => {
  // For demonstration, we'll just set a default user
  // This makes all protected routes accessible without authentication
  req.user = { id: 1, role: 'admin' };
  next();
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };