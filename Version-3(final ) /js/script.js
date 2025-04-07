// Main JavaScript for Smart Inventory & Order Management System

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Load data from localStorage or initialize with default data if empty
    loadInitialData();
});

// Initialize application functionality
function initApp() {
    // Sidebar toggle functionality
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('collapsed');
            document.querySelector('.content').classList.toggle('expanded');
        });
    }
    
    // Logout button functionality (just for simulation)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Logout functionality would go here in a real application.');
        });
    }
    
    // Add event listeners for quick action buttons
    setupQuickActions();
    
    // Setup page-specific functionality based on current page
    setupPageSpecificFunctionality();
}

// Setup quick action buttons
function setupQuickActions() {
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const action = this.textContent.trim();
            console.log(`Quick action clicked: ${action}`);
            // In a real app, this might open a modal or navigate to a specific page
        });
    });
}

// Setup functionality specific to the current page
function setupPageSpecificFunctionality() {
    // Get current page from URL
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'products.html':
            setupProductsPage();
            break;
        case 'orders.html':
            setupOrdersPage();
            break;
        case 'customers.html':
            setupCustomersPage();
            break;
        case 'suppliers.html':
            setupSuppliersPage();
            break;
        case 'reports.html':
            setupReportsPage();
            break;
        case 'notifications.html':
            setupNotificationsPage();
            break;
        default:
            // Default is index.html (dashboard)
            setupDashboard();
    }
}

// Load initial data from localStorage or set defaults
function loadInitialData() {
    // Check if we have data in localStorage
    if (!localStorage.getItem('sioms_products')) {
        // Initialize with sample data
        const sampleProducts = [
            { id: 1, name: 'Laptop Pro', sku: 'LP-001', category: 'Electronics', supplier: 'Tech Supplies Inc.', costPrice: 800, sellingPrice: 1200, stockQuantity: 25, reorderLevel: 5 },
            { id: 2, name: 'Office Desk', sku: 'OD-001', category: 'Furniture', supplier: 'Office Solutions', costPrice: 150, sellingPrice: 300, stockQuantity: 10, reorderLevel: 3 },
            { id: 3, name: 'Wireless Mouse', sku: 'WM-001', category: 'Accessories', supplier: 'Global Electronics', costPrice: 15, sellingPrice: 30, stockQuantity: 50, reorderLevel: 10 },
            { id: 4, name: 'Monitor 24"', sku: 'MON-001', category: 'Electronics', supplier: 'Tech Supplies Inc.', costPrice: 120, sellingPrice: 200, stockQuantity: 15, reorderLevel: 5 },
            { id: 5, name: 'Keyboard', sku: 'KB-001', category: 'Accessories', supplier: 'Global Electronics', costPrice: 40, sellingPrice: 80, stockQuantity: 30, reorderLevel: 8 }
        ];
        localStorage.setItem('sioms_products', JSON.stringify(sampleProducts));
        
        const sampleCustomers = [
            { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', phone: '555-987-6543', address: '101 Customer St', city: 'Los Angeles', state: 'CA' },
            { id: 2, firstName: 'Bob', lastName: 'Williams', email: 'bob@example.com', phone: '555-876-5432', address: '202 Client Ave', city: 'Seattle', state: 'WA' },
            { id: 3, firstName: 'Carol', lastName: 'Davis', email: 'carol@example.com', phone: '555-765-4321', address: '303 Buyer Rd', city: 'Boston', state: 'MA' }
        ];
        localStorage.setItem('sioms_customers', JSON.stringify(sampleCustomers));
        
        const sampleSuppliers = [
            { id: 1, companyName: 'Tech Supplies Inc.', contactName: 'John Smith', email: 'john@techsupplies.com', phone: '555-111-2222', address: '123 Tech St', city: 'San Francisco', state: 'CA' },
            { id: 2, companyName: 'Office Solutions', contactName: 'Jane Doe', email: 'jane@officesolutions.com', phone: '555-222-3333', address: '456 Office Ave', city: 'New York', state: 'NY' },
            { id: 3, companyName: 'Global Electronics', contactName: 'Mike Johnson', email: 'mike@globalelectronics.com', phone: '555-333-4444', address: '789 Electronic Blvd', city: 'Chicago', state: 'IL' }
        ];
        localStorage.setItem('sioms_suppliers', JSON.stringify(sampleSuppliers));
        
        const sampleOrders = [
            { id: 1, customer: 'Alice Johnson', orderDate: new Date().toISOString(), status: 'Processing', totalAmount: 1230.00 },
            { id: 2, customer: 'Bob Williams', orderDate: new Date(Date.now() - 86400000).toISOString(), status: 'Shipped', totalAmount: 300.00 },
            { id: 3, customer: 'Carol Davis', orderDate: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'Delivered', totalAmount: 110.00 }
        ];
        localStorage.setItem('sioms_orders', JSON.stringify(sampleOrders));
        
        const sampleOrderDetails = [
            { id: 1, orderId: 1, productId: 1, productName: 'Laptop Pro', quantity: 1, unitPrice: 1200.00, discount: 0 },
            { id: 2, orderId: 1, productId: 3, productName: 'Wireless Mouse', quantity: 1, unitPrice: 30.00, discount: 0 },
            { id: 3, orderId: 2, productId: 2, productName: 'Office Desk', quantity: 1, unitPrice: 300.00, discount: 0 },
            { id: 4, orderId: 3, productId: 3, productName: 'Wireless Mouse', quantity: 2, unitPrice: 30.00, discount: 0 },
            { id: 5, orderId: 3, productId: 5, productName: 'Keyboard', quantity: 1, unitPrice: 80.00, discount: 0.25 }
        ];
        localStorage.setItem('sioms_order_details', JSON.stringify(sampleOrderDetails));
        
        const sampleNotifications = [
            { id: 1, title: 'Low Stock Alert', message: 'Office Desk is running low on stock', type: 'warning', time: new Date(Date.now() - 7200000).toISOString() },
            { id: 2, title: 'New Order', message: 'New order #ORD-001 has been placed', type: 'info', time: new Date().toISOString() },
            { id: 3, title: 'Payment Received', message: 'Payment for order #ORD-003 has been received', type: 'success', time: new Date(Date.now() - 86400000).toISOString() }
        ];
        localStorage.setItem('sioms_notifications', JSON.stringify(sampleNotifications));
    }
}

// Dashboard specific functionality
function setupDashboard() {
    console.log('Dashboard page loaded');
    // Dashboard already has static data for demo purposes
    // In a real application, this would load dynamic data
}

// Products page functionality
function setupProductsPage() {
    console.log('Products page loaded');
    
    // Load products from localStorage
    const products = JSON.parse(localStorage.getItem('sioms_products') || '[]');
    
    // Populate products table
    const productsTableBody = document.getElementById('products-table-body');
    if (productsTableBody) {
        productsTableBody.innerHTML = '';
        
        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.sku}</td>
                <td>${product.category}</td>
                <td>${product.supplier}</td>
                <td>$${product.costPrice.toFixed(2)}</td>
                <td>$${product.sellingPrice.toFixed(2)}</td>
                <td>${product.stockQuantity}</td>
                <td>
                    <button class="btn-small edit-product" data-id="${product.id}">Edit</button>
                    <button class="btn-small btn-danger delete-product" data-id="${product.id}">Delete</button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                editProduct(productId);
            });
        });
        
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                deleteProduct(productId);
            });
        });
    }
    
    // Handle add product form submission
    const addProductForm = document.getElementById('add-product-form');
    if (addProductForm) {
        addProductForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('product-name').value;
            const sku = document.getElementById('product-sku').value;
            const category = document.getElementById('product-category').value;
            const supplier = document.getElementById('product-supplier').value;
            const costPrice = parseFloat(document.getElementById('product-cost').value);
            const sellingPrice = parseFloat(document.getElementById('product-price').value);
            const stockQuantity = parseInt(document.getElementById('product-stock').value);
            const reorderLevel = parseInt(document.getElementById('product-reorder').value);
            
            // Create new product object
            const newProduct = {
                id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
                name,
                sku,
                category,
                supplier,
                costPrice,
                sellingPrice,
                stockQuantity,
                reorderLevel
            };
            
            // Add to products array
            products.push(newProduct);
            
            // Save to localStorage
            localStorage.setItem('sioms_products', JSON.stringify(products));
            
            // Refresh the table
            setupProductsPage();
            
            // Reset the form
            addProductForm.reset();
            
            // Show success message
            alert('Product added successfully!');
        });
    }
}

// Edit product functionality
function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('sioms_products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // In a real application, this would open a modal with a form
        // For this demo, we'll use prompt dialogs
        product.name = prompt('Enter product name:', product.name) || product.name;
        product.sku = prompt('Enter product SKU:', product.sku) || product.sku;
        product.category = prompt('Enter product category:', product.category) || product.category;
        product.supplier = prompt('Enter product supplier:', product.supplier) || product.supplier;
        product.costPrice = parseFloat(prompt('Enter cost price:', product.costPrice)) || product.costPrice;
        product.sellingPrice = parseFloat(prompt('Enter selling price:', product.sellingPrice)) || product.sellingPrice;
        product.stockQuantity = parseInt(prompt('Enter stock quantity:', product.stockQuantity)) || product.stockQuantity;
        product.reorderLevel = parseInt(prompt('Enter reorder level:', product.reorderLevel)) || product.reorderLevel;
        
        // Save updated products to localStorage
        localStorage.setItem('sioms_products', JSON.stringify(products));
        
        // Refresh the table
        setupProductsPage();
        
        // Show success message
        alert('Product updated successfully!');
    }
}

// Delete product functionality
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        let products = JSON.parse(localStorage.getItem('sioms_products') || '[]');
        products = products.filter(p => p.id !== productId);
        
        // Save updated products to localStorage
        localStorage.setItem('sioms_products', JSON.stringify(products));
        
        // Refresh the table
        setupProductsPage();
        
        // Show success message
        alert('Product deleted successfully!');
    }
}

// Orders page functionality
function setupOrdersPage() {
    console.log('Orders page loaded');
    
    // Load orders from localStorage
    const orders = JSON.parse(localStorage.getItem('sioms_orders') || '[]');
    const products = JSON.parse(localStorage.getItem('sioms_products') || '[]');
    
    // Populate orders table
    const ordersTableBody = document.getElementById('orders-table-body');
    if (ordersTableBody) {
        ordersTableBody.innerHTML = '';
        
        orders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            const formattedDate = orderDate.toLocaleDateString();
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#ORD-${order.id.toString().padStart(3, '0')}</td>
                <td>${order.customer}</td>
                <td>${formattedDate}</td>
                <td>$${order.totalAmount.toFixed(2)}</td>
                <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
                <td>
                    <button class="btn-small view-order" data-id="${order.id}">View</button>
                    <button class="btn-small btn-secondary update-status" data-id="${order.id}">Update Status</button>
                </td>
            `;
            ordersTableBody.appendChild(row);
        });
        
        // Add event listeners for view order buttons
        document.querySelectorAll('.view-order').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = parseInt(this.getAttribute('data-id'));
                viewOrderDetails(orderId);
            });
        });
        
        // Add event listeners for update status buttons
        document.querySelectorAll('.update-status').forEach(btn => {
            btn.addEventListener('click', function() {
                const orderId = parseInt(this.getAttribute('data-id'));
                updateOrderStatus(orderId);
            });
        });
    }
    
    // Populate product dropdown
    const productSelect = document.getElementById('order-product');
    if (productSelect) {
        // Clear existing options except the first one
        while (productSelect.options.length > 1) {
            productSelect.remove(1);
        }
        
        // Add product options
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} - $${product.sellingPrice.toFixed(2)}`;
            option.dataset.price = product.sellingPrice;
            productSelect.appendChild(option);
        });
    }
    
    // Initialize order items array for the current order
    let currentOrderItems = [];
    let orderTotal = 0;
    
    // Add product to order button
    const addProductBtn = document.getElementById('add-product-to-order');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            const productSelect = document.getElementById('order-product');
            const quantityInput = document.getElementById('order-quantity');
            
            const productId = parseInt(productSelect.value);
            const quantity = parseInt(quantityInput.value);
            
            if (!productId || quantity < 1) {
                alert('Please select a product and enter a valid quantity.');
                return;
            }
            
            const selectedProduct = products.find(p => p.id === productId);
            if (!selectedProduct) {
                alert('Selected product not found.');
                return;
            }
            
            // Check if product already exists in the order
            const existingItemIndex = currentOrderItems.findIndex(item => item.productId === productId);
            
            if (existingItemIndex >= 0) {
                // Update existing item
                currentOrderItems[existingItemIndex].quantity += quantity;
                currentOrderItems[existingItemIndex].subtotal = 
                    currentOrderItems[existingItemIndex].quantity * currentOrderItems[existingItemIndex].unitPrice;
            } else {
                // Add new item
                const newItem = {
                    productId,
                    productName: selectedProduct.name,
                    quantity,
                    unitPrice: selectedProduct.sellingPrice,
                    discount: 0,
                    subtotal: quantity * selectedProduct.sellingPrice
                };
                
                currentOrderItems.push(newItem);
            }
            
            // Update order items table
            updateOrderItemsTable();
            
            // Reset quantity
            quantityInput.value = 1;
        });
    }
    
    // Function to update the order items table
    function updateOrderItemsTable() {
        const orderItemsBody = document.getElementById('order-items-body');
        const orderTotalElement = document.getElementById('order-total');
        
        if (orderItemsBody) {
            orderItemsBody.innerHTML = '';
            
            orderTotal = 0;
            
            currentOrderItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toFixed(2)}</td>
                    <td>$${item.subtotal.toFixed(2)}</td>
                    <td>
                        <button class="btn-small btn-danger remove-item" data-index="${index}">Remove</button>
                    </td>
                `;
                orderItemsBody.appendChild(row);
                
                orderTotal += item.subtotal;
            });
            
            // Update total
            if (orderTotalElement) {
                orderTotalElement.textContent = `$${orderTotal.toFixed(2)}`;
            }
            
            // Add event listeners for remove buttons
            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', function() {
                    const index = parseInt(this.getAttribute('data-index'));
                    currentOrderItems.splice(index, 1);
                    updateOrderItemsTable();
                });
            });
        }
    }
    
    // Handle new order form submission
    const newOrderForm = document.getElementById('new-order-form');
    if (newOrderForm) {
        newOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get customer value
            const customer = document.getElementById('order-customer').value;
            
            if (!customer) {
                alert('Please select a customer.');
                return;
            }
            
            if (currentOrderItems.length === 0) {
                alert('Please add at least one product to the order.');
                return;
            }
            
            // Create new order object
            const newOrderId = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
            const newOrder = {
                id: newOrderId,
                customer,
                orderDate: new Date().toISOString(),
                status: 'Processing',
                totalAmount: orderTotal
            };
            
            // Add to orders array
            orders.push(newOrder);
            
            // Save to localStorage
            localStorage.setItem('sioms_orders', JSON.stringify(orders));
            
            // Get existing order details
            const orderDetails = JSON.parse(localStorage.getItem('sioms_order_details') || '[]');
            
            // Add new order details
            currentOrderItems.forEach(item => {
                const newDetailId = orderDetails.length > 0 ? Math.max(...orderDetails.map(d => d.id)) + 1 : 1;
                
                const orderDetail = {
                    id: newDetailId,
                    orderId: newOrderId,
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    discount: item.discount
                };
                
                orderDetails.push(orderDetail);
            });
            
            // Save order details to localStorage
            localStorage.setItem('sioms_order_details', JSON.stringify(orderDetails));
            
            // Update stock quantities
            updateProductStock(currentOrderItems);
            
            // Refresh the table
            setupOrdersPage();
            
            // Reset the form and order items
            newOrderForm.reset();
            currentOrderItems = [];
            updateOrderItemsTable();
            
            // Show success message
            alert('Order created successfully!');
        });
    }
}

// Function to update product stock after order creation
function updateProductStock(orderItems) {
    const products = JSON.parse(localStorage.getItem('sioms_products') || '[]');
    
    orderItems.forEach(item => {
        const productIndex = products.findIndex(p => p.id === item.productId);
        
        if (productIndex >= 0) {
            // Reduce stock quantity
            products[productIndex].stockQuantity -= item.quantity;
            
            // Check if stock is low
            if (products[productIndex].stockQuantity <= products[productIndex].reorderLevel) {
                // Create a notification for low stock
                createLowStockNotification(products[productIndex]);
            }
        }
    });
    
    // Save updated products to localStorage
    localStorage.setItem('sioms_products', JSON.stringify(products));
}

// Function to create a low stock notification
function createLowStockNotification(product) {
    const notifications = JSON.parse(localStorage.getItem('sioms_notifications') || '[]');
    
    const newNotification = {
        id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
        title: 'Low Stock Alert',
        message: `${product.name} is running low on stock (${product.stockQuantity} remaining)`,
        type: 'warning',
        time: new Date().toISOString()
    };
    
    notifications.push(newNotification);
    localStorage.setItem('sioms_notifications', JSON.stringify(notifications));
}

// View order details functionality
function viewOrderDetails(orderId) {
    // Load order details from localStorage
    const orderDetails = JSON.parse(localStorage.getItem('sioms_order_details') || '[]');
    const orders = JSON.parse(localStorage.getItem('sioms_orders') || '[]');
    const orderItems = orderDetails.filter(item => item.orderId === orderId);
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found.');
        return;
    }
    
    // Create modal element if it doesn't exist
    let modalContainer = document.getElementById('order-details-modal');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'order-details-modal';
        modalContainer.className = 'modal';
        modalContainer.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modal-title">Order Details</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body" id="modal-body">
                    <!-- Content will be inserted here -->
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary close-modal-btn">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalContainer);
        
        // Add event listeners for closing the modal
        const closeButtons = modalContainer.querySelectorAll('.close-modal, .close-modal-btn');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                modalContainer.style.display = 'none';
            });
        });
        
        // Close modal when clicking outside the content
        window.addEventListener('click', function(event) {
            if (event.target === modalContainer) {
                modalContainer.style.display = 'none';
            }
        });
    }
    
    // Get modal body
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    
    // Set modal title
    modalTitle.textContent = `Order #ORD-${orderId.toString().padStart(3, '0')} Details`;
    
    // Format order date
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toLocaleDateString() + ' ' + orderDate.toLocaleTimeString();
    
    // Create order info section
    let content = `
        <div class="order-info">
            <p><strong>Customer:</strong> ${order.customer}</p>
            <p><strong>Date:</strong> ${formattedDate}</p>
            <p><strong>Status:</strong> <span class="status ${order.status.toLowerCase()}">${order.status}</span></p>
        </div>
    `;
    
    if (orderItems.length > 0) {
        // Create order items table
        content += `
            <h3>Order Items</h3>
            <table class="order-details-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Discount</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        orderItems.forEach(item => {
            const subtotal = item.quantity * item.unitPrice * (1 - item.discount);
            content += `
                <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.unitPrice.toFixed(2)}</td>
                    <td>${item.discount > 0 ? (item.discount * 100) + '%' : '-'}</td>
                    <td>$${subtotal.toFixed(2)}</td>
                </tr>
            `;
        });
        
        // Calculate total
        const total = orderItems.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice * (1 - item.discount));
        }, 0);
        
        content += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="4" class="text-right"><strong>Total:</strong></td>
                        <td>$${total.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>
        `;
    } else {
        content += '<p>No items found for this order.</p>';
    }
    
    // Set modal content
    modalBody.innerHTML = content;
    
    // Show the modal
    modalContainer.style.display = 'block';
}

// Update order status functionality
function updateOrderStatus(orderId) {
    const orders = JSON.parse(localStorage.getItem('sioms_orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex >= 0) {
        const currentStatus = orders[orderIndex].status;
        let newStatus;
        
        // Determine next status based on current status
        switch (currentStatus) {
            case 'Pending':
                newStatus = 'Processing';
                break;
            case 'Processing':
                newStatus = 'Shipped';
                break;
            case 'Shipped':
                newStatus = 'Delivered';
                break;
            case 'Delivered':
                alert('Order is already delivered.');
                return;
            default:
                newStatus = 'Processing';
        }
        
        // Confirm status update
        if (confirm(`Update order status from ${currentStatus} to ${newStatus}?`)) {
            // Update order status
            orders[orderIndex].status = newStatus;
            
            // Save to localStorage
            localStorage.setItem('sioms_orders', JSON.stringify(orders));
            
            // Refresh the orders page
            setupOrdersPage();
            
            // Show success message
            alert(`Order status updated to ${newStatus}.`);
        }
    } else {
        alert('Order not found.');
    }
}

// Customers page functionality
function setupCustomersPage() {
    console.log('Customers page loaded');
    
    // Load customers from localStorage
    const customers = JSON.parse(localStorage.getItem('sioms_customers') || '[]');
    
    // Populate customers table
    const customersTableBody = document.getElementById('customers-table-body');
    if (customersTableBody) {
        customersTableBody.innerHTML = '';
        
        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.firstName} ${customer.lastName}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.city}, ${customer.state}</td>
                <td>
                    <button class="btn-small edit-customer" data-id="${customer.id}">Edit</button>
                    <button class="btn-small btn-danger delete-customer" data-id="${customer.id}">Delete</button>
                </td>
            `;
            customersTableBody.appendChild(row);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-customer').forEach(btn => {
            btn.addEventListener('click', function() {
                const customerId = parseInt(this.getAttribute('data-id'));
                editCustomer(customerId);
            });
        });
        
        document.querySelectorAll('.delete-customer').forEach(btn => {
            btn.addEventListener('click', function() {
                const customerId = parseInt(this.getAttribute('data-id'));
                deleteCustomer(customerId);
            });
        });
    }
    
    // Handle add customer form submission
    const addCustomerForm = document.getElementById('add-customer-form');
    if (addCustomerForm) {
        addCustomerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const firstName = document.getElementById('customer-first-name').value;
            const lastName = document.getElementById('customer-last-name').value;
            const email = document.getElementById('customer-email').value;
            const phone = document.getElementById('customer-phone').value;
            const address = document.getElementById('customer-address').value;
            const city = document.getElementById('customer-city').value;
            const state = document.getElementById('customer-state').value;
            
            // Create new customer object
            const newCustomer = {
                id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
                firstName,
                lastName,
                email,
                phone,
                address,
                city,
                state
            };
            
            // Add to customers array
            customers.push(newCustomer);
            
            // Save to localStorage
            localStorage.setItem('sioms_customers', JSON.stringify(customers));
            
            // Refresh the table
            setupCustomersPage();
            
            // Reset the form
            addCustomerForm.reset();
            
            // Show success message
            alert('Customer added successfully!');
        });
    }
}

// Edit customer functionality
function editCustomer(customerId) {
    const customers = JSON.parse(localStorage.getItem('sioms_customers') || '[]');
    const customer = customers.find(c => c.id === customerId);
    
    if (customer) {
        // In a real application, this would open a modal with a form
        // For this demo, we'll use prompt dialogs
        customer.firstName = prompt('Enter first name:', customer.firstName) || customer.firstName;
        customer.lastName = prompt('Enter last name:', customer.lastName) || customer.lastName;
        customer.email = prompt('Enter email:', customer.email) || customer.email;
        customer.phone = prompt('Enter phone:', customer.phone) || customer.phone;
        customer.address = prompt('Enter address:', customer.address) || customer.address;
        customer.city = prompt('Enter city:', customer.city) || customer.city;
        customer.state = prompt('Enter state:', customer.state) || customer.state;
        
        // Save updated customers to localStorage
        localStorage.setItem('sioms_customers', JSON.stringify(customers));
        
        // Refresh the table
        setupCustomersPage();
        
        // Show success message
        alert('Customer updated successfully!');
    }
}

// Delete customer functionality
function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        let customers = JSON.parse(localStorage.getItem('sioms_customers') || '[]');
        customers = customers.filter(c => c.id !== customerId);
        
        // Save updated customers to localStorage
        localStorage.setItem('sioms_customers', JSON.stringify(customers));
        
        // Refresh the table
        setupCustomersPage();
        
        // Show success message
        alert('Customer deleted successfully!');
    }
}

// Suppliers page functionality
function setupSuppliersPage() {
    console.log('Suppliers page loaded');
    
    // Load suppliers from localStorage
    const suppliers = JSON.parse(localStorage.getItem('sioms_suppliers') || '[]');
    
    // Populate suppliers table
    const suppliersTableBody = document.getElementById('suppliers-table-body');
    if (suppliersTableBody) {
        suppliersTableBody.innerHTML = '';
        
        suppliers.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.id}</td>
                <td>${supplier.companyName}</td>
                <td>${supplier.contactName}</td>
                <td>${supplier.email}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.city}, ${supplier.state}</td>
                <td>
                    <button class="btn-small edit-supplier" data-id="${supplier.id}">Edit</button>
                    <button class="btn-small btn-danger delete-supplier" data-id="${supplier.id}">Delete</button>
                </td>
            `;
            suppliersTableBody.appendChild(row);
        });
        
        // Add event listeners for edit and delete buttons
        document.querySelectorAll('.edit-supplier').forEach(btn => {
            btn.addEventListener('click', function() {
                const supplierId = parseInt(this.getAttribute('data-id'));
                editSupplier(supplierId);
            });
        });
        
        document.querySelectorAll('.delete-supplier').forEach(btn => {
            btn.addEventListener('click', function() {
                const supplierId = parseInt(this.getAttribute('data-id'));
                deleteSupplier(supplierId);
            });
        });
    }
    
    // Handle add supplier form submission
    const addSupplierForm = document.getElementById('add-supplier-form');
    if (addSupplierForm) {
        addSupplierForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const companyName = document.getElementById('supplier-company').value;
            const contactName = document.getElementById('supplier-contact').value;
            const email = document.getElementById('supplier-email').value;
            const phone = document.getElementById('supplier-phone').value;
            const address = document.getElementById('supplier-address').value;
            const city = document.getElementById('supplier-city').value;
            const state = document.getElementById('supplier-state').value;
            
            // Create new supplier object
            const newSupplier = {
                id: suppliers.length > 0 ? Math.max(...suppliers.map(s => s.id)) + 1 : 1,
                companyName,
                contactName,
                email,
                phone,
                address,
                city,
                state
            };
            
            // Add to suppliers array
            suppliers.push(newSupplier);
            
            // Save to localStorage
            localStorage.setItem('sioms_suppliers', JSON.stringify(suppliers));
            
            // Refresh the table
            setupSuppliersPage();
            
            // Reset the form
            addSupplierForm.reset();
            
            // Show success message
            alert('Supplier added successfully!');
        });
    }
}

// Edit supplier functionality
function editSupplier(supplierId) {
    const suppliers = JSON.parse(localStorage.getItem('sioms_suppliers') || '[]');
    const supplier = suppliers.find(s => s.id === supplierId);
    
    if (supplier) {
        // In a real application, this would open a modal with a form
        // For this demo, we'll use prompt dialogs
        supplier.companyName = prompt('Enter company name:', supplier.companyName) || supplier.companyName;
        supplier.contactName = prompt('Enter contact name:', supplier.contactName) || supplier.contactName;
        supplier.email = prompt('Enter email:', supplier.email) || supplier.email;
        supplier.phone = prompt('Enter phone:', supplier.phone) || supplier.phone;
        supplier.address = prompt('Enter address:', supplier.address) || supplier.address;
        supplier.city = prompt('Enter city:', supplier.city) || supplier.city;
        supplier.state = prompt('Enter state:', supplier.state) || supplier.state;
        
        // Save updated suppliers to localStorage
        localStorage.setItem('sioms_suppliers', JSON.stringify(suppliers));
        
        // Refresh the table
        setupSuppliersPage();
        
        // Show success message
        alert('Supplier updated successfully!');
    }
}

// Delete supplier functionality
function deleteSupplier(supplierId) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        let suppliers = JSON.parse(localStorage.getItem('sioms_suppliers') || '[]');
        suppliers = suppliers.filter(s => s.id !== supplierId);
        
        // Save updated suppliers to localStorage
        localStorage.setItem('sioms_suppliers', JSON.stringify(suppliers));
        
        // Refresh the table
        setupSuppliersPage();
        
        // Show success message
        alert('Supplier deleted successfully!');
    }
}

// Reports page functionality
function setupReportsPage() {
    console.log('Reports page loaded');
    
    // Handle generate report form submission
    const generateReportForm = document.getElementById('generate-report-form');
    if (generateReportForm) {
        generateReportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const reportType = document.getElementById('report-type').value;
            const reportFormat = document.getElementById('report-format').value;
            const startDate = document.getElementById('report-start-date').value;
            const endDate = document.getElementById('report-end-date').value;
            
            // Simulate report generation
            console.log(`Generating ${reportType} report in ${reportFormat} format from ${startDate} to ${endDate}`);
            
            // Show success message
            alert(`Report generation initiated. The ${reportType} report will be available shortly.`);
            
            // In a real application, this would trigger a backend process
            // For this demo, we'll just add a simulated report to the table
            const reportsTableBody = document.getElementById('reports-table-body');
            if (reportsTableBody) {
                const now = new Date();
                const formattedDate = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reportType} Report</td>
                    <td>${formattedDate}</td>
                    <td>${reportFormat}</td>
                    <td>Admin</td>
                    <td><span class="status completed">Completed</span></td>
                    <td>
                        <button class="btn-small">Download</button>
                    </td>
                `;
                reportsTableBody.appendChild(row);
            }
            
            // Reset the form
            generateReportForm.reset();
        });
    }
    
    // Add event listeners for download buttons (just for simulation)
    document.querySelectorAll('#reports-table-body .btn-small').forEach(btn => {
        btn.addEventListener('click', function() {
            alert('In a real application, this would download the report file.');
        });
    });
}

// Notifications page functionality
function setupNotificationsPage() {
    console.log('Notifications page loaded');
    
    // Load notifications from localStorage
    const notifications = JSON.parse(localStorage.getItem('sioms_notifications') || '[]');
    
    // Populate notifications list
    const notificationsList = document.getElementById('notifications-list');
    if (notificationsList) {
        notificationsList.innerHTML = '';
        
        notifications.forEach(notification => {
            const notificationTime = new Date(notification.time);
            const timeAgo = getTimeAgo(notificationTime);
            
            const li = document.createElement('li');
            li.className = `notification ${notification.type}`;
            li.innerHTML = `
                <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                <div class="notification-content">
                    <h3>${notification.title}</h3>
                    <p>${notification.message}</p>
                    <span class="notification-time">${timeAgo}</span>
                </div>
                <button class="btn-small mark-read" data-id="${notification.id}">Mark as Read</button>
            `;
            notificationsList.appendChild(li);
        });
        
        // Add event listeners for mark as read buttons
        document.querySelectorAll('.mark-read').forEach(btn => {
            btn.addEventListener('click', function() {
                const notificationId = parseInt(this.getAttribute('data-id'));
                markNotificationAsRead(notificationId);
            });
        });
    }
    
    // Handle mark all as read button
    const markAllReadBtn = document.getElementById('mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            markAllNotificationsAsRead();
        });
    }
}

// Get appropriate icon for notification type
function getNotificationIcon(type) {
    switch(type) {
        case 'warning':
            return 'exclamation-circle';
        case 'info':
            return 'info-circle';
        case 'success':
            return 'check-circle';
        default:
            return 'bell';
    }
}

// Get time ago string from date
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + " year" + (interval === 1 ? "" : "s") + " ago";
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " month" + (interval === 1 ? "" : "s") + " ago";
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " day" + (interval === 1 ? "" : "s") + " ago";
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + " hour" + (interval === 1 ? "" : "s") + " ago";
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + " minute" + (interval === 1 ? "" : "s") + " ago";
    }
    
    return Math.floor(seconds) + " second" + (seconds === 1 ? "" : "s") + " ago";
}

// Mark notification as read
function markNotificationAsRead(notificationId) {
    let notifications = JSON.parse(localStorage.getItem('sioms_notifications') || '[]');
    
    // Find the notification and mark it as read
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
        notification.isRead = true;
        
        // Save updated notifications to localStorage
        localStorage.setItem('sioms_notifications', JSON.stringify(notifications));
        
        // Refresh the notifications list
        setupNotificationsPage();
        
        // Show success message
        alert('Notification marked as read.');
    }
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    let notifications = JSON.parse(localStorage.getItem('sioms_notifications') || '[]');
    
    // Mark all notifications as read
    notifications.forEach(notification => {
        notification.isRead = true;
    });
    
    // Save updated notifications to localStorage
    localStorage.setItem('sioms_notifications', JSON.stringify(notifications));
    
    // Refresh the notifications list
    setupNotificationsPage();
    
    // Show success message
    alert('All notifications marked as read.');
}