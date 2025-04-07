// Customer controller for handling customer-related requests
const Customer = require('../models/customerModel');

/**
 * Get all customers
 * @route GET /api/customers
 * @access Private
 */
const getCustomers = async (req, res) => {
  try {
    const filters = {
      status: req.query.status
    };

    const customers = await Customer.getAllCustomers(filters);
    res.status(200).json(customers);
  } catch (error) {
    console.error('Error in getCustomers:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get customer by ID
 * @route GET /api/customers/:id
 * @access Private
 */
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.getCustomerById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error in getCustomerById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new customer
 * @route POST /api/customers
 * @access Private
 */
const createCustomer = async (req, res) => {
  try {
    // Basic validation
    const { customer_name, email } = req.body;
    
    if (!customer_name || !email) {
      return res.status(400).json({ message: 'Please provide customer name and email' });
    }
    
    const customerData = {
      customer_name,
      email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postal_code,
      country: req.body.country,
      status: req.body.status
    };
    
    const customer = await Customer.createCustomer(customerData);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error in createCustomer:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update customer
 * @route PUT /api/customers/:id
 * @access Private
 */
const updateCustomer = async (req, res) => {
  try {
    const customerExists = await Customer.getCustomerById(req.params.id);
    
    if (!customerExists) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const customerData = {
      customer_name: req.body.customer_name,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postal_code,
      country: req.body.country,
      status: req.body.status
    };
    
    const customer = await Customer.updateCustomer(req.params.id, customerData);
    res.status(200).json(customer);
  } catch (error) {
    console.error('Error in updateCustomer:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete customer
 * @route DELETE /api/customers/:id
 * @access Private
 */
const deleteCustomer = async (req, res) => {
  try {
    const customerExists = await Customer.getCustomerById(req.params.id);
    
    if (!customerExists) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const deleted = await Customer.deleteCustomer(req.params.id);
    
    if (deleted) {
      res.status(200).json({ message: 'Customer deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete customer' });
    }
  } catch (error) {
    console.error('Error in deleteCustomer:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get customer orders
 * @route GET /api/customers/:id/orders
 * @access Private
 */
const getCustomerOrders = async (req, res) => {
  try {
    const customerExists = await Customer.getCustomerById(req.params.id);
    
    if (!customerExists) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    const orders = await Customer.getCustomerOrders(req.params.id);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getCustomerOrders:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders
};