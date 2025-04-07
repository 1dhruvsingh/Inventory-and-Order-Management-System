// Payment controller for handling payment-related requests
const Payment = require('../models/paymentModel');

/**
 * Get all payments
 * @route GET /api/payments
 * @access Private
 */
const getPayments = async (req, res) => {
  try {
    const filters = {
      order_id: req.query.order_id,
      status: req.query.status,
      payment_method: req.query.payment_method,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const payments = await Payment.getAllPayments(filters);
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error in getPayments:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get payment by ID
 * @route GET /api/payments/:id
 * @access Private
 */
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.getPaymentById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error in getPaymentById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new payment
 * @route POST /api/payments
 * @access Private
 */
const createPayment = async (req, res) => {
  try {
    // Basic validation
    const { order_id, amount, payment_method } = req.body;
    
    if (!order_id || !amount || !payment_method) {
      return res.status(400).json({ 
        message: 'Please provide order ID, amount, and payment method' 
      });
    }
    
    const paymentData = {
      order_id,
      amount,
      payment_method,
      transaction_id: req.body.transaction_id,
      status: req.body.status || 'pending',
      notes: req.body.notes
    };
    
    const payment = await Payment.createPayment(paymentData);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error in createPayment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update payment status
 * @route PUT /api/payments/:id/status
 * @access Private
 */
const updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Please provide a status' });
    }
    
    const paymentExists = await Payment.getPaymentById(req.params.id);
    
    if (!paymentExists) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const payment = await Payment.updatePaymentStatus(req.params.id, status);
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete payment
 * @route DELETE /api/payments/:id
 * @access Private
 */
const deletePayment = async (req, res) => {
  try {
    const paymentExists = await Payment.getPaymentById(req.params.id);
    
    if (!paymentExists) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if payment can be deleted (e.g., only if it's pending)
    if (paymentExists.status !== 'pending') {
      return res.status(400).json({ 
        message: 'Only pending payments can be deleted' 
      });
    }
    
    const deleted = await Payment.deletePayment(req.params.id);
    
    if (deleted) {
      res.status(200).json({ message: 'Payment deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete payment' });
    }
  } catch (error) {
    console.error('Error in deletePayment:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get payments for an order
 * @route GET /api/payments/order/:orderId
 * @access Private
 */
const getPaymentsByOrderId = async (req, res) => {
  try {
    const payments = await Payment.getPaymentsByOrderId(req.params.orderId);
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error in getPaymentsByOrderId:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentsByOrderId
};