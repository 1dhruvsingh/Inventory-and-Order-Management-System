/**
 * Payments JavaScript for handling payment management
 */

// API URL - Change this to match your backend URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const paymentsTableBody = document.getElementById('paymentsTableBody');
const paymentForm = document.getElementById('paymentForm');
const paymentModal = document.getElementById('paymentModal');
const modalTitle = document.getElementById('modalTitle');
const addPaymentBtn = document.getElementById('addPaymentBtn');
const cancelPaymentBtn = document.getElementById('cancelPaymentBtn');
const searchInput = document.getElementById('searchPayment');
const searchBtn = document.getElementById('searchBtn');
const statusFilter = document.getElementById('statusFilter');
const paymentsPagination = document.getElementById('paymentsPagination');
const logoutBtn = document.getElementById('logoutBtn');

// State variables
let currentPage = 1;
let totalPages = 1;
let paymentsPerPage = 10;
let currentFilter = '';
let currentSearch = '';

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

    // Set default payment date to today
    const today = new Date().toISOString().split('T')[0];
    if (document.getElementById('paymentDate')) {
        document.getElementById('paymentDate').value = today;
    }

    // Load initial data
    loadPayments();
    loadOrders();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add payment button
    if (addPaymentBtn) {
        addPaymentBtn.addEventListener('click', () => {
            resetPaymentForm();
            modalTitle.textContent = 'Record New Payment';
            paymentModal.style.display = 'block';
        });
    }

    // Cancel button in modal
    if (cancelPaymentBtn) {
        cancelPaymentBtn.addEventListener('click', () => {
            paymentModal.style.display = 'none';
        });
    }

    // Close modals when clicking on X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            paymentModal.style.display = 'none';
            // Close payment details modal if it exists
            const paymentDetailsModal = document.getElementById('paymentDetailsModal');
            if (paymentDetailsModal) {
                paymentDetailsModal.style.display = 'none';
            }
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
        // Close payment details modal if it exists
        const paymentDetailsModal = document.getElementById('paymentDetailsModal');
        if (paymentDetailsModal && e.target === paymentDetailsModal) {
            paymentDetailsModal.style.display = 'none';
        }
    });

    // Payment form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }

    // Order selection change - auto-populate amount
    const orderSelect = document.getElementById('paymentOrder');
    if (orderSelect) {
        orderSelect.addEventListener('change', () => {
            const selectedOption = orderSelect.options[orderSelect.selectedIndex];
            const amountInput = document.getElementById('paymentAmount');
            
            if (selectedOption && selectedOption.dataset.amount && amountInput) {
                // Set the payment amount to the order total
                amountInput.value = parseFloat(selectedOption.dataset.amount).toFixed(2);
            }
        });
    }

    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadPayments();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                currentSearch = searchInput.value.trim();
                currentPage = 1;
                loadPayments();
            }
        });
    }

    // Status filter
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentFilter = statusFilter.value;
            currentPage = 1;
            loadPayments();
        });
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.auth.logout();
        });
    }
}

// Load payments from API
async function loadPayments() {
    try {
        // Show loading state
        paymentsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading payments...</td></tr>';

        // Build query parameters
        let queryParams = `?page=${currentPage}&limit=${paymentsPerPage}`;
        if (currentSearch) {
            queryParams += `&search=${encodeURIComponent(currentSearch)}`;
        }
        if (currentFilter) {
            queryParams += `&status=${encodeURIComponent(currentFilter)}`;
        }

        // Fetch payments from API
        const response = await fetch(`${API_URL}/payments${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load payments');
        }

        const data = await response.json();
        
        // Handle different API response formats
        let payments = [];
        let total = 0;
        
        if (Array.isArray(data)) {
            // If API returns an array directly
            payments = data;
            total = data.length;
        } else if (data.payments && Array.isArray(data.payments)) {
            // If API returns an object with payments array
            payments = data.payments;
            total = data.total || payments.length;
        } else {
            // Fallback if structure is different
            payments = data;
            total = payments.length;
        }
        
        // Update pagination
        totalPages = Math.ceil(total / paymentsPerPage) || 1;
        updatePagination();

        // Clear table
        paymentsTableBody.innerHTML = '';

        // Check if no payments found
        if (payments.length === 0) {
            paymentsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No payments found</td></tr>';
            return;
        }

        // Render payments
        payments.forEach(payment => {
            const row = document.createElement('tr');
            
            // Format date
            const paymentDate = payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A';
            
            // Get payment status badge class
            const statusBadgeClass = getPaymentStatusBadgeClass(payment.status);
            
            row.innerHTML = `
                <td>${payment.payment_id}</td>
                <td>${payment.order_id || 'N/A'}</td>
                <td>${payment.customer_name || 'N/A'}</td>
                <td>${paymentDate}</td>
                <td>$${parseFloat(payment.amount).toFixed(2)}</td>
                <td>${payment.payment_method || 'N/A'}</td>
                <td>
                    <span class="badge ${statusBadgeClass}">
                        ${payment.status || 'pending'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-payment" data-id="${payment.payment_id}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon edit-payment" data-id="${payment.payment_id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-payment" data-id="${payment.payment_id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            paymentsTableBody.appendChild(row);
        });
        
        // Add helper function for payment status badge
        function getPaymentStatusBadgeClass(status) {
            switch (status?.toLowerCase()) {
                case 'completed':
                    return 'badge-success';
                case 'pending':
                    return 'badge-warning';
                case 'failed':
                    return 'badge-danger';
                case 'refunded':
                    return 'badge-info';
                default:
                    return 'badge-secondary';
            }
        }

        // Add event listeners to action buttons
        document.querySelectorAll('.view-payment').forEach(button => {
            button.addEventListener('click', () => viewPaymentDetails(button.dataset.id));
        });

        document.querySelectorAll('.edit-payment').forEach(button => {
            button.addEventListener('click', () => editPayment(button.dataset.id));
        });

        document.querySelectorAll('.delete-payment').forEach(button => {
            button.addEventListener('click', () => deletePayment(button.dataset.id));
        });

    } catch (error) {
        console.error('Error loading payments:', error);
        paymentsTableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error loading payments: ${error.message}</td></tr>`;
    }
}

// Update pagination controls
function updatePagination() {
    if (!paymentsPagination) return;
    
    paymentsPagination.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination-btn');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadPayments();
        }
    });
    paymentsPagination.appendChild(prevButton);

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
            loadPayments();
        });
        paymentsPagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination-btn');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadPayments();
        }
    });
    paymentsPagination.appendChild(nextButton);
}

// Load orders for dropdown
async function loadOrders() {
    try {
        const orderSelect = document.getElementById('paymentOrder');
        if (!orderSelect) return;

        // Show loading state
        orderSelect.innerHTML = '<option value="">Loading orders...</option>';
        orderSelect.disabled = true;

        // Fetch orders that need payment (not fully paid)
        const response = await fetch(`${API_URL}/orders?limit=100`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load orders');
        }

        const data = await response.json();
        
        // Handle different API response formats
        let orders = [];
        
        if (Array.isArray(data)) {
            // If API returns an array directly
            orders = data;
        } else if (data.orders && Array.isArray(data.orders)) {
            // If API returns an object with orders array
            orders = data.orders;
        } else {
            // Fallback if structure is different
            orders = [];
            console.error('Unexpected API response format:', data);
        }

        // Populate order dropdown in form
        orderSelect.innerHTML = '<option value="">Select Order</option>';
        
        // Filter orders that might need payment
        orders.forEach(order => {
            const option = document.createElement('option');
            option.value = order.order_id;
            
            // Format the display text
            const customerName = order.customer_name || 'Unknown';
            const totalAmount = parseFloat(order.total_amount || 0).toFixed(2);
            option.textContent = `Order #${order.order_id} - ${customerName} ($${totalAmount})`;
            
            // Add data attributes for additional info
            if (order.total_amount) {
                option.dataset.amount = order.total_amount;
            }
            
            orderSelect.appendChild(option);
        });
        
        // Enable the select
        orderSelect.disabled = false;

    } catch (error) {
        console.error('Error loading orders:', error);
        const orderSelect = document.getElementById('paymentOrder');
        if (orderSelect) {
            orderSelect.innerHTML = '<option value="">Error loading orders</option>';
            orderSelect.disabled = false;
        }
    }
}

// Reset payment form
function resetPaymentForm() {
    if (!paymentForm) return;
    
    paymentForm.reset();
    document.getElementById('paymentId').value = '';
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('paymentDate').value = today;
}

// Handle payment form submission
async function handlePaymentSubmit(e) {
    e.preventDefault();
    
    try {
        const paymentId = document.getElementById('paymentId').value;
        const orderId = document.getElementById('paymentOrder').value;
        const amount = document.getElementById('paymentAmount').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const date = document.getElementById('paymentDate').value;
        const notes = document.getElementById('paymentNotes').value;
        
        // Validate form
        if (!orderId) {
            throw new Error('Please select an order');
        }
        
        if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
            throw new Error('Please enter a valid payment amount');
        }
        
        if (!paymentMethod) {
            throw new Error('Please select a payment method');
        }
        
        // Prepare payment data
        const paymentData = {
            order_id: orderId,
            amount: parseFloat(amount),
            payment_method: paymentMethod,
            payment_date: date,
            status: 'pending', // Set default status
            notes: notes
        };
        
        let url = `${API_URL}/payments`;
        let httpMethod = 'POST';
        
        // If editing existing payment
        if (paymentId) {
            // For existing payments, we need to update the status through the status endpoint
            if (paymentData.status) {
                const statusResponse = await fetch(`${API_URL}/payments/${paymentId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${window.auth.getToken()}`
                    },
                    body: JSON.stringify({ status: paymentData.status })
                });
                
                if (!statusResponse.ok) {
                    const errorData = await statusResponse.json();
                    throw new Error(errorData.message || 'Failed to update payment status');
                }
            }
            
            // Since the backend doesn't have a direct PUT endpoint for payments,
            // we'll handle this by creating a new payment with the updated information
            // and then deleting the old one if needed in a future update
        }
        
        // Send request to API
        const response = await fetch(url, {
            method: httpMethod,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.auth.getToken()}`
            },
            body: JSON.stringify(paymentData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save payment');
        }
        
        // Close modal and reload payments
        paymentModal.style.display = 'none';
        loadPayments();
        
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

// View payment details
async function viewPaymentDetails(paymentId) {
    try {
        // Create a payment details modal if it doesn't exist
        let paymentDetailsModal = document.getElementById('paymentDetailsModal');
        
        if (!paymentDetailsModal) {
            // Create the modal element
            paymentDetailsModal = document.createElement('div');
            paymentDetailsModal.id = 'paymentDetailsModal';
            paymentDetailsModal.className = 'modal';
            
            // Create modal content
            paymentDetailsModal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Payment Details</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body" id="paymentDetailsContent">
                        <div class="text-center">Loading payment details...</div>
                    </div>
                </div>
            `;
            
            // Add modal to the document
            document.body.appendChild(paymentDetailsModal);
            
            // Add event listener to close button
            paymentDetailsModal.querySelector('.close-modal').addEventListener('click', () => {
                paymentDetailsModal.style.display = 'none';
            });
            
            // Close modal when clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === paymentDetailsModal) {
                    paymentDetailsModal.style.display = 'none';
                }
            });
        }
        
        // Show loading state
        const paymentDetailsContent = document.getElementById('paymentDetailsContent') || 
                                      paymentDetailsModal.querySelector('.modal-body');
        paymentDetailsContent.innerHTML = '<div class="text-center">Loading payment details...</div>';
        paymentDetailsModal.style.display = 'block';

        // Fetch payment details
        const response = await fetch(`${API_URL}/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payment details');
        }

        const payment = await response.json();

        // Format date
        const paymentDate = payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A';
        
        // Get status badge class
        const statusClass = payment.status === 'completed' ? 'badge-success' : 
                           payment.status === 'pending' ? 'badge-warning' : 
                           payment.status === 'failed' ? 'badge-danger' : 'badge-secondary';

        // Build HTML for payment details
        let html = `
            <div class="payment-details">
                <div class="payment-details-header">
                    <div>
                        <h3>Payment #${payment.payment_id}</h3>
                        <p>Date: ${paymentDate}</p>
                        <p>Status: <span class="badge ${statusClass}">${payment.status || 'pending'}</span></p>
                    </div>
                    <div>
                        <p><strong>Order:</strong> #${payment.order_id || 'N/A'}</p>
                        <p><strong>Customer:</strong> ${payment.customer_name || 'N/A'}</p>
                        <p><strong>Amount:</strong> $${parseFloat(payment.amount).toFixed(2)}</p>
                    </div>
                </div>

                <div class="payment-info">
                    <h4>Payment Information</h4>
                    <p><strong>Method:</strong> ${payment.payment_method || 'N/A'}</p>
                    <p><strong>Transaction ID:</strong> ${payment.transaction_id || 'N/A'}</p>
                </div>

                <div class="payment-notes">
                    <h4>Notes</h4>
                    <p>${payment.notes || 'No notes available'}</p>
                </div>
            </div>
        `;

        // Update modal content
        paymentDetailsContent.innerHTML = html;

    } catch (error) {
        console.error('Error viewing payment details:', error);
        const paymentDetailsContent = document.getElementById('paymentDetailsContent');
        if (paymentDetailsContent) {
            paymentDetailsContent.innerHTML = `<div class="text-center text-danger">Error loading payment details: ${error.message}</div>`;
        } else {
            alert(`Error: ${error.message}`);
        }
    }
}

// Edit payment
async function editPayment(paymentId) {
    try {
        // Fetch payment details
        const response = await fetch(`${API_URL}/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch payment details');
        }

        const payment = await response.json();

        // Populate form with payment details
        document.getElementById('paymentId').value = payment.payment_id;
        
        // Handle order selection
        const orderSelect = document.getElementById('paymentOrder');
        if (orderSelect) {
            // Check if the order option exists
            let orderExists = false;
            for (let i = 0; i < orderSelect.options.length; i++) {
                if (orderSelect.options[i].value == payment.order_id) {
                    orderExists = true;
                    break;
                }
            }
            
            // If order doesn't exist in dropdown, add it
            if (!orderExists && payment.order_id) {
                const option = document.createElement('option');
                option.value = payment.order_id;
                option.textContent = `Order #${payment.order_id} - ${payment.customer_name || 'Unknown'}`;
                orderSelect.appendChild(option);
            }
            
            // Set the value
            orderSelect.value = payment.order_id;
        }
        
        // Set other form fields
        document.getElementById('paymentAmount').value = payment.amount;
        
        const methodSelect = document.getElementById('paymentMethod');
        if (methodSelect && payment.payment_method) {
            // Check if the payment method exists in the dropdown
            let methodExists = false;
            for (let i = 0; i < methodSelect.options.length; i++) {
                if (methodSelect.options[i].value === payment.payment_method) {
                    methodExists = true;
                    break;
                }
            }
            
            // If method doesn't exist, add it
            if (!methodExists) {
                const option = document.createElement('option');
                option.value = payment.payment_method;
                option.textContent = payment.payment_method;
                methodSelect.appendChild(option);
            }
            
            methodSelect.value = payment.payment_method;
        }
        
        // Handle payment date
        const dateInput = document.getElementById('paymentDate');
        if (dateInput && payment.payment_date) {
            // Format date for input (YYYY-MM-DD)
            const date = payment.payment_date.split('T')[0];
            dateInput.value = date;
        } else if (dateInput) {
            // Set to today if no date
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
        
        // Set notes
        const notesInput = document.getElementById('paymentNotes');
        if (notesInput) {
            notesInput.value = payment.notes || '';
        }

        // Show modal
        modalTitle.textContent = 'Edit Payment';
        paymentModal.style.display = 'block';

    } catch (error) {
        console.error('Error editing payment:', error);
        alert(`Error: ${error.message}`);
    }
}

// Update payment status
async function updatePaymentStatus(paymentId, newStatus) {
    try {
        // Send update request to API
        const response = await fetch(`${API_URL}/payments/${paymentId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.auth.getToken()}`
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update payment status');
        }

        // Reload payments
        loadPayments();
        return true;
    } catch (error) {
        console.error('Error updating payment status:', error);
        alert(`Error: ${error.message}`);
        return false;
    }
}

// Delete payment
async function deletePayment(paymentId) {
    try {
        // Confirm deletion
        if (!confirm('Are you sure you want to delete this payment?')) {
            return;
        }

        // Send delete request to API
        const response = await fetch(`${API_URL}/payments/${paymentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete payment');
        }

        // Reload payments
        loadPayments();

    } catch (error) {
        console.error('Error deleting payment:', error);
        alert(`Error: ${error.message}`);
    }
}