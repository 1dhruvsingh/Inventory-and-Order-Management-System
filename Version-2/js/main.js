/**
 * Main JavaScript file for Smart Inventory and Order Management System
 * This file contains client-side functionality for simulating database operations
 */

// Store data in localStorage to simulate a database
const DB = {
    // Initialize database with sample data if it doesn't exist
    init: function() {
        if (!localStorage.getItem('users')) {
            // Sample Users
            const users = [
                { id: 1, username: 'admin', fullName: 'Admin User', email: 'admin@example.com', role: 'Admin', phone: '555-0100', status: 'Active' },
                { id: 2, username: 'manager', fullName: 'Manager User', email: 'manager@example.com', role: 'Manager', phone: '555-0101', status: 'Active' },
                { id: 3, username: 'staff1', fullName: 'Staff One', email: 'staff1@example.com', role: 'Staff', phone: '555-0102', status: 'Active' }
            ];
            localStorage.setItem('users', JSON.stringify(users));
            
            // Sample Suppliers
            const suppliers = [
                { id: 1, companyName: 'Tech Supplies Inc.', contactName: 'John Smith', email: 'john@techsupplies.com', phone: '555-1001', address: '123 Tech St', city: 'San Francisco', state: 'CA', postalCode: '94105', country: 'USA', status: 'Active' },
                { id: 2, companyName: 'Office Solutions', contactName: 'Mary Johnson', email: 'mary@officesolutions.com', phone: '555-1002', address: '456 Office Blvd', city: 'New York', state: 'NY', postalCode: '10001', country: 'USA', status: 'Active' },
                { id: 3, companyName: 'Global Electronics', contactName: 'Robert Lee', email: 'robert@globalelectronics.com', phone: '555-1003', address: '789 Electronic Ave', city: 'Chicago', state: 'IL', postalCode: '60007', country: 'USA', status: 'Active' }
            ];
            localStorage.setItem('suppliers', JSON.stringify(suppliers));
            
            // Sample Customers
            const customers = [
                { id: 1, firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', phone: '555-2001', address: '101 Customer Lane', city: 'Los Angeles', state: 'CA', postalCode: '90001', country: 'USA', customerType: 'Regular' },
                { id: 2, firstName: 'Bob', lastName: 'Williams', email: 'bob@example.com', phone: '555-2002', address: '202 Buyer Street', city: 'Miami', state: 'FL', postalCode: '33101', country: 'USA', customerType: 'VIP' },
                { id: 3, firstName: 'Charlie', lastName: 'Davis', email: 'charlie@example.com', phone: '555-2003', address: '303 Client Road', city: 'Seattle', state: 'WA', postalCode: '98101', country: 'USA', customerType: 'Wholesale' }
            ];
            localStorage.setItem('customers', JSON.stringify(customers));
            
            // Sample Products
            const products = [
                { id: 1, productName: 'Laptop Pro X', description: '15-inch professional laptop with 16GB RAM', sku: 'LP-001', category: 'Electronics', supplierId: 1, costPrice: 800.00, sellingPrice: 1200.00, stockQuantity: 25, reorderLevel: 5, status: 'Available' },
                { id: 2, productName: 'Office Desk', description: 'Adjustable height office desk', sku: 'OD-002', category: 'Furniture', supplierId: 2, costPrice: 150.00, sellingPrice: 299.99, stockQuantity: 10, reorderLevel: 3, status: 'Available' },
                { id: 3, productName: 'Wireless Mouse', description: 'Ergonomic wireless mouse', sku: 'WM-003', category: 'Accessories', supplierId: 3, costPrice: 15.00, sellingPrice: 29.99, stockQuantity: 50, reorderLevel: 10, status: 'Available' },
                { id: 4, productName: 'Desk Chair', description: 'Comfortable office chair with lumbar support', sku: 'DC-004', category: 'Furniture', supplierId: 2, costPrice: 100.00, sellingPrice: 199.99, stockQuantity: 15, reorderLevel: 5, status: 'Available' },
                { id: 5, productName: 'USB-C Cable', description: 'High-speed USB-C charging cable', sku: 'UC-005', category: 'Accessories', supplierId: 3, costPrice: 5.00, sellingPrice: 12.99, stockQuantity: 100, reorderLevel: 20, status: 'Available' }
            ];
            localStorage.setItem('products', JSON.stringify(products));
            
            // Sample Orders
            const orders = [
                { id: 1, customerId: 1, userId: 3, orderDate: '2023-01-15T10:30:00', totalAmount: 1229.99, status: 'Delivered', paymentStatus: 'Paid', shippingAddress: '101 Customer Lane', shippingCity: 'Los Angeles', shippingState: 'CA', shippingPostalCode: '90001', shippingCountry: 'USA' },
                { id: 2, customerId: 2, userId: 2, orderDate: '2023-01-20T14:45:00', totalAmount: 499.98, status: 'Processing', paymentStatus: 'Partial', shippingAddress: '202 Buyer Street', shippingCity: 'Miami', shippingState: 'FL', shippingPostalCode: '33101', shippingCountry: 'USA' },
                { id: 3, customerId: 3, userId: 3, orderDate: '2023-01-25T09:15:00', totalAmount: 3000.00, status: 'Pending', paymentStatus: 'Unpaid', shippingAddress: '303 Client Road', shippingCity: 'Seattle', shippingState: 'WA', shippingPostalCode: '98101', shippingCountry: 'USA' }
            ];
            localStorage.setItem('orders', JSON.stringify(orders));
            
            // Sample Order Details
            const orderDetails = [
                { id: 1, orderId: 1, productId: 1, quantity: 1, unitPrice: 1200.00, discount: 0.00, subtotal: 1200.00 },
                { id: 2, orderId: 1, productId: 3, quantity: 1, unitPrice: 29.99, discount: 0.00, subtotal: 29.99 },
                { id: 3, orderId: 2, productId: 4, quantity: 2, unitPrice: 199.99, discount: 0.00, subtotal: 399.98 },
                { id: 4, orderId: 2, productId: 5, quantity: 5, unitPrice: 12.99, discount: 0.00, subtotal: 64.95 },
                { id: 5, orderId: 3, productId: 1, quantity: 2, unitPrice: 1200.00, discount: 0.00, subtotal: 2400.00 },
                { id: 6, orderId: 3, productId: 2, quantity: 2, unitPrice: 299.99, discount: 0.00, subtotal: 599.98 }
            ];
            localStorage.setItem('orderDetails', JSON.stringify(orderDetails));
            
            // Sample Payments
            const payments = [
                { id: 1, orderId: 1, paymentDate: '2023-01-15T10:35:00', amount: 1229.99, paymentMethod: 'Credit Card', transactionId: 'TXN-001-CC', status: 'Completed' },
                { id: 2, orderId: 2, paymentDate: '2023-01-20T14:50:00', amount: 200.00, paymentMethod: 'Cash', transactionId: 'TXN-002-CASH', status: 'Completed' },
                { id: 3, orderId: 2, paymentDate: '2023-01-21T09:30:00', amount: 100.00, paymentMethod: 'Bank Transfer', transactionId: 'TXN-002-BT', status: 'Pending' }
            ];
            localStorage.setItem('payments', JSON.stringify(payments));
            
            // Sample Stock Logs
            const stockLogs = [
                { id: 1, productId: 1, userId: 1, quantityChanged: 30, previousQuantity: 0, newQuantity: 30, type: 'Purchase', reference: 'PO-001', logDate: '2023-01-10T08:00:00' },
                { id: 2, productId: 1, userId: 3, quantityChanged: -5, previousQuantity: 30, newQuantity: 25, type: 'Sale', reference: 'Order-001', logDate: '2023-01-15T10:30:00' },
                { id: 3, productId: 2, userId: 1, quantityChanged: 15, previousQuantity: 0, newQuantity: 15, type: 'Purchase', reference: 'PO-002', logDate: '2023-01-10T08:30:00' },
                { id: 4, productId: 2, userId: 3, quantityChanged: -5, previousQuantity: 15, newQuantity: 10, type: 'Sale', reference: 'Order-002', logDate: '2023-01-20T14:45:00' },
                { id: 5, productId: 3, userId: 1, quantityChanged: 60, previousQuantity: 0, newQuantity: 60, type: 'Purchase', reference: 'PO-003', logDate: '2023-01-10T09:00:00' },
                { id: 6, productId: 3, userId: 3, quantityChanged: -10, previousQuantity: 60, newQuantity: 50, type: 'Sale', reference: 'Order-003', logDate: '2023-01-25T09:15:00' }
            ];
            localStorage.setItem('stockLogs', JSON.stringify(stockLogs));
            
            // Sample Notifications
            const notifications = [
                { id: 1, userId: 1, title: 'Low Stock Alert', message: 'Product "Office Desk" is below reorder level', type: 'Warning', relatedTo: 'Product', relatedId: 2, isRead: false, createdAt: '2023-01-20T15:00:00' },
                { id: 2, userId: 2, title: 'New Order', message: 'New order #3 has been placed', type: 'Info', relatedTo: 'Order', relatedId: 3, isRead: false, createdAt: '2023-01-25T09:20:00' },
                { id: 3, userId: 3, title: 'Payment Received', message: 'Payment for order #1 has been completed', type: 'Success', relatedTo: 'Payment', relatedId: 1, isRead: true, createdAt: '2023-01-15T10:40:00' }
            ];
            localStorage.setItem('notifications', JSON.stringify(notifications));
            
            // Sample Reports
            const reports = [
                { id: 1, userId: 1, reportName: 'Monthly Sales Report - Jan 2023', reportType: 'Sales', parameters: '{"month":1,"year":2023}', fileFormat: 'PDF', filePath: '/reports/sales_2023_01.pdf', generatedAt: '2023-02-01T09:00:00' },
                { id: 2, userId: 1, reportName: 'Inventory Status Report', reportType: 'Inventory', parameters: '{"date":"2023-01-31"}', fileFormat: 'Excel', filePath: '/reports/inventory_2023_01_31.xlsx', generatedAt: '2023-02-01T10:30:00' },
                { id: 3, userId: 2, reportName: 'Customer Purchase History - Q1 2023', reportType: 'Customer', parameters: '{"quarter":1,"year":2023}', fileFormat: 'PDF', filePath: '/reports/customer_purchases_2023_q1.pdf', generatedAt: '2023-04-05T14:15:00' }
            ];
            localStorage.setItem('reports', JSON.stringify(reports));
        }
    },
    
    // Generic CRUD operations
    getAll: function(table) {
        const data = localStorage.getItem(table);
        return data ? JSON.parse(data) : [];
    },
    
    getById: function(table, id) {
        const items = this.getAll(table);
        return items.find(item => item.id === parseInt(id));
    },
    
    add: function(table, item) {
        const items = this.getAll(table);
        // Generate a new ID
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        item.id = newId;
        
        // Add timestamps if applicable
        if (!item.createdAt) {
            item.createdAt = new Date().toISOString();
        }
        
        items.push(item);
        localStorage.setItem(table, JSON.stringify(items));
        return item;
    },
    
    update: function(table, id, updatedItem) {
        const items = this.getAll(table);
        const index = items.findIndex(item => item.id === parseInt(id));
        
        if (index !== -1) {
            // Preserve the ID
            updatedItem.id = parseInt(id);
            
            // Update timestamp if applicable
            if (items[index].updatedAt !== undefined) {
                updatedItem.updatedAt = new Date().toISOString();
            }
            
            items[index] = updatedItem;
            localStorage.setItem(table, JSON.stringify(items));
            return updatedItem;
        }
        
        return null;
    },
    
    delete: function(table, id) {
        const items = this.getAll(table);
        const filteredItems = items.filter(item => item.id !== parseInt(id));
        
        if (filteredItems.length < items.length) {
            localStorage.setItem(table, JSON.stringify(filteredItems));
            return true;
        }
        
        return false;
    },
    
    // Custom queries
    getOrdersWithCustomerInfo: function() {
        const orders = this.getAll('orders');
        const customers = this.getAll('customers');
        
        return orders.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            return {
                ...order,
                customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown Customer'
            };
        });
    },
    
    getOrderDetails: function(orderId) {
        const orderDetails = this.getAll('orderDetails');
        const products = this.getAll('products');
        
        return orderDetails
            .filter(detail => detail.orderId === parseInt(orderId))
            .map(detail => {
                const product = products.find(p => p.id === detail.productId);
                return {
                    ...detail,
                    productName: product ? product.productName : 'Unknown Product',
                    sku: product ? product.sku : ''
                };
            });
    },
    
    getLowStockProducts: function() {
        const products = this.getAll('products');
        return products.filter(product => product.stockQuantity <= product.reorderLevel);
    },
    
    getProductsWithSupplierInfo: function() {
        const products = this.getAll('products');
        const suppliers = this.getAll('suppliers');
        
        return products.map(product => {
            const supplier = suppliers.find(s => s.id === product.supplierId);
            return {
                ...product,
                supplierName: supplier ? supplier.companyName : 'Unknown Supplier'
            };
        });
    },
    
    getUnreadNotifications: function(userId) {
        const notifications = this.getAll('notifications');
        return notifications.filter(notification => 
            notification.userId === parseInt(userId) && !notification.isRead
        );
    },
    
    markNotificationAsRead: function(notificationId) {
        const notifications = this.getAll('notifications');
        const index = notifications.findIndex(n => n.id === parseInt(notificationId));
        
        if (index !== -1) {
            notifications[index].isRead = true;
            localStorage.setItem('notifications', JSON.stringify(notifications));
            return true;
        }
        
        return false;
    },
    
    addStockLog: function(productId, userId, quantityChanged, type, reference) {
        const product = this.getById('products', productId);
        
        if (product) {
            const previousQuantity = product.stockQuantity;
            const newQuantity = previousQuantity + quantityChanged;
            
            // Update product stock
            product.stockQuantity = newQuantity;
            
            // Update product status based on stock level
            if (newQuantity <= 0) {
                product.status = 'Out of Stock';
            } else if (newQuantity <= product.reorderLevel) {
                product.status = 'Low Stock';
            } else {
                product.status = 'Available';
            }
            
            this.update('products', productId, product);
            
            // Create stock log entry
            const stockLog = {
                productId: parseInt(productId),
                userId: parseInt(userId),
                quantityChanged,
                previousQuantity,
                newQuantity,
                type,
                reference,
                logDate: new Date().toISOString()
            };
            
            this.add('stockLogs', stockLog);
            
            // Create notification for low stock if applicable
            if (newQuantity <= product.reorderLevel && newQuantity > 0) {
                const notification = {
                    userId: 1, // Assuming admin is user ID 1
                    title: 'Low Stock Alert',
                    message: `Product "${product.productName}" is below reorder level`,
                    type: 'Warning',
                    relatedTo: 'Product',
                    relatedId: parseInt(productId),
                    isRead: false,
                    createdAt: new Date().toISOString()
                };
                
                this.add('notifications', notification);
            }
            
            return stockLog;
        }
        
        return null;
    },
    
    createOrder: function(orderData, orderItems) {
        // Create the order
        const order = this.add('orders', orderData);
        
        if (order) {
            // Add order details
            orderItems.forEach(item => {
                const product = this.getById('products', item.productId);
                
                if (product) {
                    const orderDetail = {
                        orderId: order.id,
                        productId: parseInt(item.productId),
                        quantity: parseInt(item.quantity),
                        unitPrice: parseFloat(product.sellingPrice),
                        discount: parseFloat(item.discount || 0),
                        subtotal: parseFloat(product.sellingPrice) * parseInt(item.quantity) * (1 - parseFloat(item.discount || 0) / 100)
                    };
                    
                    this.add('orderDetails', orderDetail);
                    
                    // Update stock
                    this.addStockLog(
                        item.productId,
                        orderData.userId,
                        -item.quantity,
                        'Sale',
                        `Order-${order.id}`
                    );
                }
            });
            
            // Create notification for new order
            const notification = {
                userId: 2, // Assuming manager is user ID 2
                title: 'New Order',
                message: `New order #${order.id} has been placed`,
                type: 'Info',
                relatedTo: 'Order',
                relatedId: order.id,
                isRead: false,
                createdAt: new Date().toISOString()
            };
            
            this.add('notifications', notification);
            
            return order;
        }
        
        return null;
    },
    
    addPayment: function(paymentData) {
        const payment = this.add('payments', paymentData);
        
        if (payment) {
            // Update order payment status
            const order = this.getById('orders', payment.orderId);
            const orderPayments = this.getAll('payments').filter(p => p.orderId === payment.orderId);
            const totalPaid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
            
            if (order) {
                if (totalPaid >= order.totalAmount) {
                    order.paymentStatus = 'Paid';
                } else if (totalPaid > 0) {
                    order.paymentStatus = 'Partial';
                } else {
                    order.paymentStatus = 'Unpaid';
                }
                
                this.update('orders', order.id, order);
                
                // Create notification for payment
                const notification = {
                    userId: 3, // Assuming staff is user ID 3
                    title: 'Payment Received',
                    message: `Payment for order #${order.id} has been ${payment.status.toLowerCase()}`,
                    type: 'Success',
                    relatedTo: 'Payment',
                    relatedId: payment.id,
                    isRead: false,
                    createdAt: new Date().toISOString()
                };
                
                this.add('notifications', notification);
            }
            
            return payment;
        }
        
        return null;
    },
    
    generateReport: function(reportData) {
        // In a real system, this would generate an actual report file
        // For this simulation, we'll just create a report record
        const report = this.add('reports', reportData);
        
        if (report) {
            // Create notification for new report
            const notification = {
                userId: reportData.userId,
                title: 'Report Generated',
                message: `Your report "${reportData.reportName}" is ready`,
                type: 'Info',
                relatedTo: 'Report',
                relatedId: report.id,
                isRead: false,
                createdAt: new Date().toISOString()
            };
            
            this.add('notifications', notification);
            
            return report;
        }
        
        return null;
    }
};

// UI Helper Functions
const UI = {
    // Display a notification message
    showNotification: function(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        const container = document.querySelector('.container');
        const main = document.querySelector('main');
        
        container.insertBefore(alertDiv, main);
        
        // Remove the alert after 3 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    },
    
    // Format date for display
    formatDate: function(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },
    
    // Format currency for display
    formatCurrency: function(amount) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    },
    
    // Create a badge element
    createBadge: function(text, type) {
        const badge = document.createElement('span');
        badge.className = `badge badge-${type}`;
        badge.textContent = text;
        return badge;
    },
    
    // Get status badge type
    getStatusBadgeType: function(status) {
        const statusMap = {
            'Available': 'success',
            'Low Stock': 'warning',
            'Out of Stock': 'danger',
            'Discontinued': 'secondary',
            'Active': 'success',
            'Inactive': 'secondary',
            'Pending': 'warning',
            'Processing': 'info',
            'Shipped': 'primary',
            'Delivered': 'success',
            'Cancelled': 'danger',
            'Completed': 'success',
            'Failed': 'danger',
            'Refunded': 'warning',
            'Unpaid': 'danger',
            'Partial': 'warning',
            'Paid': 'success'
        };
        
        return statusMap[status] || 'secondary';
    },
    
    // Populate a select element with options
    populateSelect: function(selectElement, items, valueProperty, textProperty, selectedValue = null) {
        selectElement.innerHTML = '<option value="">Select an option</option>';
        
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueProperty];
            option.textContent = item[textProperty];
            
            if (selectedValue !== null && item[valueProperty] == selectedValue) {
                option.selected = true;
            }
            
            selectElement.appendChild(option);
        });
    },
    
    // Create a modal dialog
    createModal: function(title, content, onSave = null) {
        // Create modal elements
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        const modalTitle = document.createElement('h3');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = title;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        });
        
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        
        if (typeof content === 'string') {
            modalBody.innerHTML = content;
        } else {
            modalBody.appendChild(content);
        }
        
        const modalFooter = document.createElement('div');
        modalFooter.className = 'modal-footer';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'btn btn-secondary';
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        });
        
        modalFooter.appendChild(cancelButton);
        
        if (onSave) {
            const saveButton = document.createElement('button');
            saveButton.className = 'btn btn-primary';
            saveButton.textContent = 'Save';
            saveButton.addEventListener('click', () => {
                onSave();
                modalOverlay.classList.remove('active');
                setTimeout(() => {
                    modalOverlay.remove();
                }, 300);
            });
            
            modalFooter.appendChild(saveButton);
        }
        
        // Assemble modal
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        modal.appendChild(modalHeader);
        modal.appendChild(modalBody);
        modal.appendChild(modalFooter);
        
        modalOverlay.appendChild(modal);
        
        // Add to document
        document.body.appendChild(modalOverlay);
        
        // Show modal with animation
        setTimeout(() => {
            modalOverlay.classList.add('active');
        }, 10);
        
        return modalOverlay;
    },
    
    // Create a confirmation dialog
    confirmDialog: function(message, onConfirm) {
        const content = `<p>${message}</p>`;
        
        const modalOverlay = this.createModal('Confirm Action', content, onConfirm);
        
        return modalOverlay;
    }
};

// Initialize the database when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the database
    DB.init();
    
    // Setup mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('nav ul');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }
    
    // Check if we're on the dashboard page
    const dashboardCards = document.querySelector('.dashboard-cards');
    
    if (dashboardCards) {
        // We're on the dashboard page, update the cards
        const products = DB.getAll('products');
        const orders = DB.getAll('orders');
        const customers = DB.getAll('customers');
        const lowStockProducts = DB.getLowStockProducts();
        
        // Update dashboard cards with counts
        document.getElementById('totalProducts').textContent = products.length;
        document.getElementById('totalOrders').textContent = orders.length;
        document.getElementById('totalCustomers').textContent = customers.length;
        document.getElementById('lowStockCount').textContent = lowStockProducts.length;
    }
});
