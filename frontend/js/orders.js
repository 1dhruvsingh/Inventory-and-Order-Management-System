/**
 * Orders JavaScript for handling order management
 */

// API URL - Change this to match your backend URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const ordersTableBody = document.getElementById('ordersTableBody');
const orderForm = document.getElementById('orderForm');
const orderModal = document.getElementById('orderModal');
const orderDetailsModal = document.getElementById('orderDetailsModal');
const modalTitle = document.getElementById('modalTitle');
const addOrderBtn = document.getElementById('addOrderBtn');
const cancelOrderBtn = document.getElementById('cancelOrderBtn');
const addItemBtn = document.getElementById('addItemBtn');
const orderItemsContainer = document.getElementById('orderItemsContainer');
const searchInput = document.getElementById('searchOrder');
const searchBtn = document.getElementById('searchBtn');
const statusFilter = document.getElementById('statusFilter');
const ordersPagination = document.getElementById('ordersPagination');
const logoutBtn = document.getElementById('logoutBtn');

// Update item subtotal
function updateItemSubtotal(itemId) {
    const quantityInput = document.querySelector(`.item-quantity[data-item-id="${itemId}"]`);
    const priceInput = document.querySelector(`.item-price[data-item-id="${itemId}"]`);
    const subtotalElement = document.querySelector(`.item-subtotal[data-item-id="${itemId}"]`);
    
    if (quantityInput && priceInput && subtotalElement) {
        const quantity = parseInt(quantityInput.value) || 0;
        const price = parseFloat(priceInput.value) || 0;
        const subtotal = quantity * price;
        
        subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    }
}

// Update order total
function updateOrderTotal() {
    let subtotal = 0;
    
    // Calculate subtotal from all items
    document.querySelectorAll('.item-subtotal').forEach(element => {
        const value = parseFloat(element.textContent.replace('$', '')) || 0;
        subtotal += value;
    });
    
    // Calculate tax (10%)
    const tax = subtotal * 0.1;
    
    // Calculate total
    const total = subtotal + tax;
    
    // Update summary display
    orderSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    orderTax.textContent = `$${tax.toFixed(2)}`;
    orderTotal.textContent = `$${total.toFixed(2)}`;
}

// Order summary elements
const orderSubtotal = document.getElementById('orderSubtotal');
const orderTax = document.getElementById('orderTax');
const orderTotal = document.getElementById('orderTotal');

// State variables
let currentPage = 1;
let totalPages = 1;
let ordersPerPage = 10;
let currentFilter = '';
let currentSearch = '';
let orderItems = [];
let products = [];

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Display user info
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.fullName || user.username;
        document.getElementById('userRole').textContent = user.role;
    }

    // Set default order date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;

    // Load initial data
    loadOrders();
    loadCustomers();
    loadProducts();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add order button
    addOrderBtn.addEventListener('click', () => {
        resetOrderForm();
        modalTitle.textContent = 'Create New Order';
        orderModal.style.display = 'block';
    });

    // Cancel button in modal
    cancelOrderBtn.addEventListener('click', () => {
        orderModal.style.display = 'none';
    });

    // Close modals when clicking on X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            orderModal.style.display = 'none';
            orderDetailsModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
        if (e.target === orderDetailsModal) {
            orderDetailsModal.style.display = 'none';
        }
    });

    // Add item button
    addItemBtn.addEventListener('click', addOrderItemRow);

    // Order form submission
    orderForm.addEventListener('submit', handleOrderSubmit);

    // Search functionality
    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadOrders();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadOrders();
        }
    });

    // Status filter
    statusFilter.addEventListener('change', () => {
        currentFilter = statusFilter.value;
        currentPage = 1;
        loadOrders();
    });

    // Logout button
    logoutBtn.addEventListener('click', () => {
        window.auth.logout();
    });
}

// Load orders from API
async function loadOrders() {
    try {
        // Show loading state
        ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading orders...</td></tr>';

        // Build query parameters
        let queryParams = `?page=${currentPage}&limit=${ordersPerPage}`;
        if (currentSearch) {
            queryParams += `&search=${encodeURIComponent(currentSearch)}`;
        }
        if (currentFilter) {
            queryParams += `&status=${encodeURIComponent(currentFilter)}`;
        }

        // Fetch orders from API
        const response = await fetch(`${API_URL}/orders${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const data = await response.json();
        
        // Update pagination
        totalPages = Math.ceil(data.total / ordersPerPage);
        updatePagination();

        // Clear table
        ordersTableBody.innerHTML = '';

        // Check if no orders found
        if (data.orders.length === 0) {
            ordersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No orders found</td></tr>';
            return;
        }

        // Render orders
        data.orders.forEach(order => {
            const row = document.createElement('tr');
            
            // Format date
            const orderDate = new Date(order.order_date).toLocaleDateString();
            
            // Get payment status
            const paymentStatus = order.payment_status || 'unpaid';
            
            row.innerHTML = `
                <td>${order.order_id}</td>
                <td>${order.customer_name || 'N/A'}</td>
                <td>${orderDate}</td>
                <td>${order.item_count || 0}</td>
                <td>$${parseFloat(order.total_amount).toFixed(2)}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(order.status)}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    <span class="badge ${paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}">
                        ${paymentStatus}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-order" data-id="${order.order_id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-order" data-id="${order.order_id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-order" data-id="${order.order_id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            ordersTableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        document.querySelectorAll('.view-order').forEach(button => {
            button.addEventListener('click', () => viewOrderDetails(button.dataset.id));
        });

        document.querySelectorAll('.edit-order').forEach(button => {
            button.addEventListener('click', () => editOrder(button.dataset.id));
        });

        document.querySelectorAll('.delete-order').forEach(button => {
            button.addEventListener('click', () => deleteOrder(button.dataset.id));
        });

    } catch (error) {
        console.error('Error loading orders:', error);
        ordersTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading orders: ${error.message}</td></tr>`;
    }
}

// Get status badge class based on status
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'badge-warning';
        case 'processing':
            return 'badge-info';
        case 'shipped':
            return 'badge-primary';
        case 'delivered':
            return 'badge-success';
        case 'cancelled':
            return 'badge-danger';
        default:
            return 'badge-secondary';
    }
}

// Load customers for dropdown
async function loadCustomers() {
    try {
        const response = await fetch(`${API_URL}/customers`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load customers');
        }

        const customers = await response.json();

        // Populate customer dropdown in form
        const orderCustomer = document.getElementById('orderCustomer');
        orderCustomer.innerHTML = '<option value="">Select Customer</option>';
        customers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.customer_id;
            option.textContent = `${customer.name} (${customer.email})`;
            orderCustomer.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// Load products for order items
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        const data = await response.json();
        products = data.products;

    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Reset order form
function resetOrderForm() {
    orderForm.reset();
    document.getElementById('orderId').value = '';
    
    // Clear order items
    orderItemsContainer.innerHTML = '';
    orderItems = [];
    
    // Reset totals
    orderSubtotal.textContent = '$0.00';
    orderTax.textContent = '$0.00';
    orderTotal.textContent = '$0.00';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    
    // Add first item row
    addOrderItemRow();
}

// Update pagination controls
function updatePagination() {
    ordersPagination.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination-btn');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadOrders();
        }
    });
    ordersPagination.appendChild(prevButton);

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('pagination-btn');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            loadOrders();
        });
        ordersPagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination-btn');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadOrders();
        }
    });
    ordersPagination.appendChild(nextButton);
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        // Show loading state
        const orderDetailsContent = document.getElementById('orderDetailsContent');
        orderDetailsContent.innerHTML = '<div class="text-center">Loading order details...</div>';
        orderDetailsModal.style.display = 'block';

        // Fetch order details
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        const order = await response.json();

        // Format date
        const orderDate = new Date(order.order_date).toLocaleDateString();

        // Build HTML for order details
        let html = `
            <div class="order-details">
                <div class="order-details-header">
                    <div>
                        <h3>Order #${order.order_id}</h3>
                        <p>Date: ${orderDate}</p>
                        <p>Status: <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></p>
                    </div>
                    <div>
                        <p><strong>Customer:</strong> ${order.customer_name || 'N/A'}</p>
                        <p><strong>Email:</strong> ${order.customer_email || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${order.customer_phone || 'N/A'}</p>
                    </div>
                </div>

                <div class="order-items">
                    <h4>Order Items</h4>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.product_name}</td>
                                    <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
                                    <td>${item.quantity}</td>
                                    <td>$${(parseFloat(item.unit_price) * parseInt(item.quantity)).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-right"><strong>Subtotal:</strong></td>
                                <td>$${parseFloat(order.subtotal || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-right"><strong>Tax:</strong></td>
                                <td>$${parseFloat(order.tax || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                                <td>$${parseFloat(order.total_amount || 0).toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="order-notes">
                    <h4>Notes</h4>
                    <p>${order.notes || 'No notes available'}</p>
                </div>
            </div>
        `;

        // Update modal content
        orderDetailsContent.innerHTML = html;

    } catch (error) {
        console.error('Error loading order details:', error);
        orderDetailsContent.innerHTML = `<div class="text-center text-danger">Error loading order details: ${error.message}</div>`;
    }
}

// Add order item row
function addOrderItemRow() {
    const itemRow = document.createElement('div');
    itemRow.className = 'order-item';
    
    // Generate a unique ID for this item
    const itemId = Date.now() + Math.floor(Math.random() * 1000);
    
    itemRow.innerHTML = `
        <div class="item-col">
            <select class="product-select" data-item-id="${itemId}" required>
                <option value="">Select Product</option>
                ${products.map(product => `<option value="${product.product_id}" data-price="${product.price}">${product.name}</option>`).join('')}
            </select>
        </div>
        <div class="item-col-sm">
            <input type="number" class="item-quantity" data-item-id="${itemId}" min="1" value="1" required>
        </div>
        <div class="item-col-sm">
            <input type="number" class="item-price" data-item-id="${itemId}" step="0.01" min="0" value="0.00" required>
        </div>
        <div class="item-col-sm item-subtotal" data-item-id="${itemId}">$0.00</div>
        <div class="item-col-xs">
            <button type="button" class="btn-icon remove-item" data-item-id="${itemId}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    orderItemsContainer.appendChild(itemRow);
    
    // Add event listeners to the new row
    const productSelect = itemRow.querySelector('.product-select');
    const quantityInput = itemRow.querySelector('.item-quantity');
    const priceInput = itemRow.querySelector('.item-price');
    const removeButton = itemRow.querySelector('.remove-item');
    
    // Product selection change
    productSelect.addEventListener('change', () => {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        if (selectedOption.value) {
            const price = selectedOption.dataset.price || 0;
            priceInput.value = parseFloat(price).toFixed(2);
            updateItemSubtotal(itemId);
            updateOrderTotal();
        }
    });
    
    // Quantity change
    quantityInput.addEventListener('change', () => {
        updateItemSubtotal(itemId);
        updateOrderTotal();
    });
    
    // Price change
    priceInput.addEventListener('change', () => {
        updateItemSubtotal(itemId);
        updateOrderTotal();
    });
    
    // Remove item
    removeButton.addEventListener('click', () => {
        itemRow.remove();
        updateOrderTotal();
    });
}

// Handle order form submission
async function handleOrderSubmit(e) {
    e.preventDefault();
    
    try {
        // Collect form data
        const orderId = document.getElementById('orderId').value;
        const customerId = document.getElementById('orderCustomer').value;
        const orderDate = document.getElementById('orderDate').value;
        const status = document.getElementById('orderStatus').value;
        const notes = document.getElementById('orderNotes').value;
        
        // Collect order items
        const items = [];
        document.querySelectorAll('.order-item').forEach(itemRow => {
            const productSelect = itemRow.querySelector('.product-select');
            const quantity = itemRow.querySelector('.item-quantity').value;
            const price = itemRow.querySelector('.item-price').value;
            
            if (productSelect.value) {
                items.push({
                    product_id: productSelect.value,
                    quantity: parseInt(quantity),
                    unit_price: parseFloat(price)
                });
            }
        });
        
        // Validate form
        if (!customerId) {
            alert('Please select a customer');
            return;
        }
        
        if (items.length === 0) {
            alert('Please add at least one item to the order');
            return;
        }
        
        // Prepare order data
        const orderData = {
            customer_id: customerId,
            order_date: orderDate,
            status: status,
            notes: notes,
            items: items
        };
        
        // Determine if this is a new order or an update
        const method = orderId ? 'PUT' : 'POST';
        const url = orderId ? `${API_URL}/orders/${orderId}` : `${API_URL}/orders`;
        
        // Send request to API
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.auth.getToken()}`
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save order');
        }
        
        // Close modal and reload orders
        orderModal.style.display = 'none';
        loadOrders();
        
    } catch (error) {
        console.error('Error saving order:', error);
        alert(`Error: ${error.message}`);
    }
}

// Edit order
async function editOrder(orderId) {
    try {
        // Fetch order details
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch order details');
        }

        const order = await response.json();

        // Reset form
        resetOrderForm();
        
        // Populate form with order details
        document.getElementById('orderId').value = order.order_id;
        document.getElementById('orderCustomer').value = order.customer_id;
        document.getElementById('orderDate').value = order.order_date.split('T')[0];
        document.getElementById('orderStatus').value = order.status;
        document.getElementById('orderNotes').value = order.notes || '';
        
        // Clear existing items
        orderItemsContainer.innerHTML = '';
        
        // Add order items
        if (order.items && order.items.length > 0) {
            order.items.forEach(item => {
                const itemRow = document.createElement('div');
                itemRow.className = 'order-item';
                
                // Generate a unique ID for this item
                const itemId = Date.now() + Math.floor(Math.random() * 1000);
                
                itemRow.innerHTML = `
                    <div class="item-col">
                        <select class="product-select" data-item-id="${itemId}" required>
                            <option value="">Select Product</option>
                            ${products.map(product => `<option value="${product.product_id}" data-price="${product.price}" ${product.product_id == item.product_id ? 'selected' : ''}>${product.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="item-col-sm">
                        <input type="number" class="item-quantity" data-item-id="${itemId}" min="1" value="${item.quantity}" required>
                    </div>
                    <div class="item-col-sm">
                        <input type="number" class="item-price" data-item-id="${itemId}" step="0.01" min="0" value="${parseFloat(item.unit_price).toFixed(2)}" required>
                    </div>
                    <div class="item-col-sm item-subtotal" data-item-id="${itemId}">$${(parseFloat(item.unit_price) * parseInt(item.quantity)).toFixed(2)}</div>
                    <div class="item-col-xs">
                        <button type="button" class="btn-icon remove-item" data-item-id="${itemId}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                
                orderItemsContainer.appendChild(itemRow);
                
                // Add event listeners to the new row
                const productSelect = itemRow.querySelector('.product-select');
                const quantityInput = itemRow.querySelector('.item-quantity');
                const priceInput = itemRow.querySelector('.item-price');
                const removeButton = itemRow.querySelector('.remove-item');
                
                // Product selection change
                productSelect.addEventListener('change', () => {
                    const selectedOption = productSelect.options[productSelect.selectedIndex];
                    if (selectedOption.value) {
                        const price = selectedOption.dataset.price || 0;
                        priceInput.value = parseFloat(price).toFixed(2);
                        updateItemSubtotal(itemId);
                        updateOrderTotal();
                    }
                });
                
                // Quantity change
                quantityInput.addEventListener('change', () => {
                    updateItemSubtotal(itemId);
                    updateOrderTotal();
                });
                
                // Price change
                priceInput.addEventListener('change', () => {
                    updateItemSubtotal(itemId);
                    updateOrderTotal();
                });
                
                // Remove item
                removeButton.addEventListener('click', () => {
                    itemRow.remove();
                    updateOrderTotal();
                });
            });
        } else {
            // Add empty item row if no items
            addOrderItemRow();
        }
        
        // Update order total
        updateOrderTotal();
        
        // Show modal
        modalTitle.textContent = 'Edit Order';
        orderModal.style.display = 'block';
    } catch (error) {
        console.error('Error editing order:', error);
        alert(`Error: ${error.message}`);
    }
}

// Delete order
async function deleteOrder(orderId) {
    try {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this order?')) {
            return;
        }

        // Send delete request to API
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete order');
        }

        // Reload orders
        loadOrders();

    } catch (error) {
        console.error('Error deleting order:', error);
        alert(`Error: ${error.message}`);
    }
}