// Supplier controller for handling supplier-related requests
const Supplier = require('../models/supplierModel');

/**
 * Get all suppliers
 * @route GET /api/suppliers
 * @access Private
 */
const getSuppliers = async (req, res) => {
  try {
    const filters = {
      status: req.query.status
    };

    const suppliers = await Supplier.getAllSuppliers(filters);
    res.status(200).json(suppliers);
  } catch (error) {
    console.error('Error in getSuppliers:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get supplier by ID
 * @route GET /api/suppliers/:id
 * @access Private
 */
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.getSupplierById(req.params.id);
    
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    res.status(200).json(supplier);
  } catch (error) {
    console.error('Error in getSupplierById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Create a new supplier
 * @route POST /api/suppliers
 * @access Private
 */
const createSupplier = async (req, res) => {
  try {
    // Basic validation
    const { supplier_name, email, phone } = req.body;
    
    if (!supplier_name || !email || !phone) {
      return res.status(400).json({ message: 'Please provide supplier name, email, and phone' });
    }
    
    const supplierData = {
      supplier_name,
      contact_person: req.body.contact_person,
      email,
      phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postal_code,
      country: req.body.country,
      status: req.body.status
    };
    
    const supplier = await Supplier.createSupplier(supplierData);
    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error in createSupplier:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update supplier
 * @route PUT /api/suppliers/:id
 * @access Private
 */
const updateSupplier = async (req, res) => {
  try {
    const supplierExists = await Supplier.getSupplierById(req.params.id);
    
    if (!supplierExists) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    const supplierData = {
      supplier_name: req.body.supplier_name,
      contact_person: req.body.contact_person,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      postal_code: req.body.postal_code,
      country: req.body.country,
      status: req.body.status
    };
    
    const supplier = await Supplier.updateSupplier(req.params.id, supplierData);
    res.status(200).json(supplier);
  } catch (error) {
    console.error('Error in updateSupplier:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete supplier
 * @route DELETE /api/suppliers/:id
 * @access Private
 */
const deleteSupplier = async (req, res) => {
  try {
    const supplierExists = await Supplier.getSupplierById(req.params.id);
    
    if (!supplierExists) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    const deleted = await Supplier.deleteSupplier(req.params.id);
    
    if (deleted) {
      res.status(200).json({ message: 'Supplier deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete supplier' });
    }
  } catch (error) {
    console.error('Error in deleteSupplier:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get supplier products
 * @route GET /api/suppliers/:id/products
 * @access Private
 */
const getSupplierProducts = async (req, res) => {
  try {
    const supplierExists = await Supplier.getSupplierById(req.params.id);
    
    if (!supplierExists) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    
    const products = await Supplier.getSupplierProducts(req.params.id);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error in getSupplierProducts:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierProducts
};