// Order controller for handling order-related requests
const Order = require('../models/orderModel');

/**
 * Get all orders
 * @route GET /api/orders
 * @access Private
 */
const getOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      customer_id: req.query.customer_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const orders = await Order.getAllOrders(filters);
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error in getOrders:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get order by ID
 * @route GET /api/orders/:id
 * @access Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.getOrderById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error in getOrderById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new order
 * @route POST /api/orders
 * @access Private
 */
const createOrder = async (req, res) => {
  try {
    // Basic validation
    const { customer_id, order_items } = req.body;
    
    if (!customer_id || !order_items || !Array.isArray(order_items) || order_items.length === 0) {
      return res.status(400).json({ 
        message: 'Please provide customer ID and at least one order item' 
      });
    }
    
    // Validate each order item
    for (const item of order_items) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        return res.status(400).json({ 
          message: 'Each order item must have product ID, quantity, and unit price' 
        });
      }
    }
    
    const orderData = {
      customer_id,
      user_id: req.user.id, // From auth middleware
      shipping_address: req.body.shipping_address,
      shipping_city: req.body.shipping_city,
      shipping_state: req.body.shipping_state,
      shipping_postal_code: req.body.shipping_postal_code,
      shipping_country: req.body.shipping_country,
      notes: req.body.notes,
      order_items
    };
    
    const order = await Order.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error('Error in createOrder:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update order status
 * @route PUT /api/orders/:id/status
 * @access Private
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Please provide a status' });
    }
    
    const orderExists = await Order.getOrderById(req.params.id);
    
    if (!orderExists) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    const order = await Order.updateOrderStatus(req.params.id, status);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete order
 * @route DELETE /api/orders/:id
 * @access Private
 */
const deleteOrder = async (req, res) => {
  try {
    const orderExists = await Order.getOrderById(req.params.id);
    
    if (!orderExists) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order can be deleted (e.g., only if it's pending)
    if (orderExists.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending orders can be deleted' 
      });
    }
    
    const deleted = await Order.deleteOrder(req.params.id);
    
    if (deleted) {
      res.status(200).json({ message: 'Order deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete order' });
    }
  } catch (error) {
    console.error('Error in deleteOrder:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Add item to order
 * @route POST /api/orders/:id/items
 * @access Private
 */
const addOrderItem = async (req, res) => {
  try {
    const { product_id, quantity, unit_price } = req.body;
    
    if (!product_id || !quantity || !unit_price) {
      return res.status(400).json({ 
        message: 'Please provide product ID, quantity, and unit price' 
      });
    }
    
    const orderExists = await Order.getOrderById(req.params.id);
    
    if (!orderExists) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order can be modified (e.g., only if it's pending)
    if (orderExists.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending orders can be modified' 
      });
    }
    
    const orderItem = {
      product_id,
      quantity,
      unit_price,
      discount: req.body.discount || 0
    };
    
    const updatedOrder = await Order.addOrderItem(req.params.id, orderItem);
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in addOrderItem:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update order item
 * @route PUT /api/orders/:id/items/:itemId
 * @access Private
 */
const updateOrderItem = async (req, res) => {
  try {
    const { quantity, unit_price } = req.body;
    
    if (!quantity && !unit_price) {
      return res.status(400).json({ 
        message: 'Please provide quantity or unit price to update' 
      });
    }
    
    const orderExists = await Order.getOrderById(req.params.id);
    
    if (!orderExists) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order can be modified (e.g., only if it's pending)
    if (orderExists.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending orders can be modified' 
      });
    }
    
    const orderItemData = {
      quantity,
      unit_price,
      discount: req.body.discount
    };
    
    const updatedOrder = await Order.updateOrderItem(req.params.id, req.params.itemId, orderItemData);
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderItem:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Remove item from order
 * @route DELETE /api/orders/:id/items/:itemId
 * @access Private
 */
const removeOrderItem = async (req, res) => {
  try {
    const orderExists = await Order.getOrderById(req.params.id);
    
    if (!orderExists) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if order can be modified (e.g., only if it's pending)
    if (orderExists.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending orders can be modified' 
      });
    }
    
    const updatedOrder = await Order.removeOrderItem(req.params.id, req.params.itemId);
    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error in removeOrderItem:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  addOrderItem,
  updateOrderItem,
  removeOrderItem
};