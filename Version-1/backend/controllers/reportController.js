// Report controller for handling business analytics and reporting
const Report = require('../models/reportModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Customer = require('../models/customerModel');
const Supplier = require('../models/supplierModel');
const Payment = require('../models/paymentModel');

/**
 * Get all reports
 * @route GET /api/reports
 * @access Private
 */
const getReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const filters = {
      report_type: req.query.report_type,
      start_date: req.query.start_date,
      end_date: req.query.end_date
    };

    const reports = await Report.getAllReports(userId, filters);
    res.status(200).json(reports);
  } catch (error) {
    console.error('Error in getReports:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get report by ID
 * @route GET /api/reports/:id
 * @access Private
 */
const getReportById = async (req, res) => {
  try {
    const report = await Report.getReportById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if report belongs to user
    if (report.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this report' });
    }
    
    res.status(200).json(report);
  } catch (error) {
    console.error('Error in getReportById:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Generate a new report
 * @route POST /api/reports
 * @access Private
 */
const generateReport = async (req, res) => {
  try {
    const { report_name, report_type, parameters } = req.body;
    const userId = req.user.id;
    
    if (!report_name || !report_type) {
      return res.status(400).json({ message: 'Please provide report name and type' });
    }
    
    let resultData = {};
    
    // Generate report data based on type
    switch (report_type) {
      case 'sales':
        resultData = await generateSalesReport(parameters);
        break;
      case 'inventory':
        resultData = await generateInventoryReport(parameters);
        break;
      case 'customer':
        resultData = await generateCustomerReport(parameters);
        break;
      case 'supplier':
        resultData = await generateSupplierReport(parameters);
        break;
      case 'payment':
        resultData = await generatePaymentReport(parameters);
        break;
      case 'custom':
        resultData = await generateCustomReport(parameters);
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    const reportData = {
      user_id: userId,
      report_name,
      report_type,
      parameters: JSON.stringify(parameters),
      result_data: JSON.stringify(resultData)
    };
    
    const report = await Report.createReport(reportData);
    res.status(201).json(report);
  } catch (error) {
    console.error('Error in generateReport:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Delete report
 * @route DELETE /api/reports/:id
 * @access Private
 */
const deleteReport = async (req, res) => {
  try {
    const report = await Report.getReportById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Check if report belongs to user
    if (report.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }
    
    const deleted = await Report.deleteReport(req.params.id);
    
    if (deleted) {
      res.status(200).json({ message: 'Report deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete report' });
    }
  } catch (error) {
    console.error('Error in deleteReport:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper functions for generating different report types

/**
 * Generate sales report
 * @param {Object} parameters - Report parameters
 * @returns {Object} Report data
 */
async function generateSalesReport(parameters) {
  const { start_date, end_date, customer_id, product_id } = parameters || {};
  
  // Build filters
  const filters = {};
  if (start_date) filters.start_date = start_date;
  if (end_date) filters.end_date = end_date;
  if (customer_id) filters.customer_id = customer_id;
  if (product_id) filters.product_id = product_id;
  
  // Get orders within date range
  const orders = await Order.getOrdersWithDetails(filters);
  
  // Calculate totals and group by relevant dimensions
  const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  const ordersByStatus = groupBy(orders, 'status');
  const ordersByDate = groupByDate(orders, 'order_date');
  
  // Get top selling products if we have order details
  const topProducts = [];
  if (orders.length > 0 && orders[0].items) {
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.product_id]) {
          productSales[item.product_id] = {
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: 0,
            total: 0
          };
        }
        productSales[item.product_id].quantity += item.quantity;
        productSales[item.product_id].total += parseFloat(item.subtotal);
      });
    });
    
    topProducts.push(...Object.values(productSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10));
  }
  
  return {
    total_sales: totalSales,
    order_count: orders.length,
    average_order_value: orders.length > 0 ? totalSales / orders.length : 0,
    orders_by_status: ordersByStatus,
    orders_by_date: ordersByDate,
    top_products: topProducts
  };
}

/**
 * Generate inventory report
 * @param {Object} parameters - Report parameters
 * @returns {Object} Report data
 */
async function generateInventoryReport(parameters) {
  const { category, supplier_id, low_stock } = parameters || {};
  
  // Build filters
  const filters = {};
  if (category) filters.category = category;
  if (supplier_id) filters.supplier_id = supplier_id;
  if (low_stock) filters.low_stock = low_stock === 'true';
  
  // Get products
  const products = await Product.getAllProducts(filters);
  
  // Calculate inventory metrics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock_quantity, 0);
  const lowStockProducts = products.filter(product => product.stock_quantity <= product.reorder_level);
  const productsByCategory = groupBy(products, 'category');
  
  // Calculate inventory value
  const inventoryValue = products.reduce((sum, product) => {
    return sum + (product.stock_quantity * parseFloat(product.unit_price));
  }, 0);
  
  return {
    total_products: totalProducts,
    total_stock: totalStock,
    inventory_value: inventoryValue,
    low_stock_count: lowStockProducts.length,
    low_stock_products: lowStockProducts,
    products_by_category: productsByCategory
  };
}

/**
 * Generate customer report
 * @param {Object} parameters - Report parameters
 * @returns {Object} Report data
 */
async function generateCustomerReport(parameters) {
  const { start_date, end_date } = parameters || {};
  
  // Build filters
  const filters = {};
  if (start_date) filters.start_date = start_date;
  if (end_date) filters.end_date = end_date;
  
  // Get customers with their orders
  const customers = await Customer.getAllCustomers();
  const customerOrders = await Promise.all(
    customers.map(async customer => {
      const orders = await Order.getOrdersByCustomer(customer.customer_id, filters);
      const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
      
      return {
        ...customer,
        order_count: orders.length,
        total_spent: totalSpent,
        average_order_value: orders.length > 0 ? totalSpent / orders.length : 0
      };
    })
  );
  
  // Sort by total spent
  const topCustomers = [...customerOrders]
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 10);
  
  return {
    total_customers: customers.length,
    active_customers: customerOrders.filter(c => c.order_count > 0).length,
    top_customers: topCustomers,
    customer_data: customerOrders
  };
}

/**
 * Generate supplier report
 * @param {Object} parameters - Report parameters
 * @returns {Object} Report data
 */
async function generateSupplierReport(parameters) {
  // Get suppliers with their products
  const suppliers = await Supplier.getAllSuppliers();
  const supplierProducts = await Promise.all(
    suppliers.map(async supplier => {
      const products = await Supplier.getSupplierProducts(supplier.supplier_id);
      const productCount = products.length;
      const totalStock = products.reduce((sum, product) => sum + product.stock_quantity, 0);
      const inventoryValue = products.reduce((sum, product) => {
        return sum + (product.stock_quantity * parseFloat(product.unit_price));
      }, 0);
      
      return {
        ...supplier,
        product_count: productCount,
        total_stock: totalStock,
        inventory_value: inventoryValue
      };
    })
  );
  
  return {
    total_suppliers: suppliers.length,
    active_suppliers: supplierProducts.filter(s => s.product_count > 0).length,
    supplier_data: supplierProducts
  };
}

/**
 * Generate payment report
 * @param {Object} parameters - Report parameters
 * @returns {Object} Report data
 */
async function generatePaymentReport(parameters) {
  const { start_date, end_date, payment_method, status } = parameters || {};
  
  // Build filters
  const filters = {};
  if (start_date) filters.start_date = start_date;
  if (end_date) filters.end_date = end_date;
  if (payment_method) filters.payment_method = payment_method;
  if (status) filters.status = status;
  
  // Get payments
  const payments = await Payment.getAllPayments(filters);
  
  // Calculate payment metrics
  const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
  const paymentsByMethod = groupBy(payments, 'payment_method');
  const paymentsByStatus = groupBy(payments, 'status');
  const paymentsByDate = groupByDate(payments, 'payment_date');
  
  return {
    total_payments: payments.length,
    total_amount: totalAmount,
    payments_by_method: paymentsByMethod,
    payments_by_status: paymentsByStatus,
    payments_by_date: paymentsByDate
  };
}

/**
 * Generate custom report
 * @param {Object} parameters - Report parameters
 * @returns {Object} Report data
 */
async function generateCustomReport(parameters) {
  // Custom reports can be implemented based on specific business needs
  // This is a placeholder for future custom report logic
  return {
    message: 'Custom report generation is not implemented yet',
    parameters
  };
}

// Utility functions

/**
 * Group array of objects by a property
 * @param {Array} array - Array to group
 * @param {string} key - Property to group by
 * @returns {Object} Grouped object
 */
function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Group array of objects by date
 * @param {Array} array - Array to group
 * @param {string} dateKey - Date property to group by
 * @returns {Object} Grouped object with dates as keys
 */
function groupByDate(array, dateKey) {
  return array.reduce((result, item) => {
    const date = new Date(item[dateKey]);
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!result[dateStr]) {
      result[dateStr] = [];
    }
    result[dateStr].push(item);
    return result;
  }, {});
}

module.exports = {
  getReports,
  getReportById,
  generateReport,
  deleteReport
};