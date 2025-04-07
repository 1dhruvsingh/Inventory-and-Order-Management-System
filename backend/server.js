// Main server file for Smart Inventory and Order Management System
// Simplified for Database Management Course
const express = require('express');
const cors = require('cors');
const { testConnection, pool } = require('./config/db');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const stockLogRoutes = require('./routes/stockLogRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database status route - useful for educational purposes
app.get('/', async (req, res) => {
  try {
    const connected = await testConnection();
    if (connected) {
      // Get some basic database stats for educational purposes
      const [tables] = await pool.query(
        "SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = 'inventory_management'"
      );
      
      res.json({ 
        status: 'success',
        message: 'Database connected successfully!', 
        database: 'inventory_management',
        tables: tables.map(t => ({ name: t.table_name, rows: t.table_rows }))
      });
    } else {
      res.status(500).json({ 
        status: 'error',
        message: 'Database connection failed. Please check your MySQL setup.' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'Database connection failed: ' + error.message 
    });
  }
});

// Educational route to show database schema
app.get('/api/schema', async (req, res) => {
  try {
    const [tables] = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'inventory_management'"
    );
    
    const schema = {};
    
    for (const table of tables) {
      const [columns] = await pool.query(
        `SHOW COLUMNS FROM ${table.table_name}`
      );
      schema[table.table_name] = columns;
    }
    
    res.json({ schema });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching schema: ' + error.message });
  }
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/stocklogs', stockLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Set port and start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Test database connection
  await testConnection();
});

module.exports = app; // For testing purposes