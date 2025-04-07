/**
 * Customers JavaScript for handling customer management
 */

// API URL - Change this to match your backend URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const customersTableBody = document.getElementById('customersTableBody');
const customerForm = document.getElementById('customerForm');
const customerModal = document.getElementById('customerModal');
const customerDetailsModal = document.getElementById('customerDetailsModal');
const modalTitle = document.getElementById('modalTitle');
const addCustomerBtn = document.getElementById('addCustomerBtn');
const cancelCustomerBtn = document.getElementById('cancelCustomerBtn');
const searchInput = document.getElementById('searchCustomer');
const searchBtn = document.getElementById('searchBtn');
const customersPagination = document.getElementById('customersPagination');
const logoutBtn = document.getElementById('logoutBtn');

// State variables
let currentPage = 1;
let totalPages = 1;
let customersPerPage = 10;
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

    // Load initial data
    loadCustomers();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add customer button
    addCustomerBtn.addEventListener('click', () => {
        resetCustomerForm();
        modalTitle.textContent = 'Add New Customer';
        customerModal.style.display = 'block';
    });

    // Cancel button in modal
    cancelCustomerBtn.addEventListener('click', () => {
        customerModal.style.display = 'none';
    });

    // Close modals when clicking on X
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            customerModal.style.display = 'none';
            customerDetailsModal.style.display = 'none';
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === customerModal) {
            customerModal.style.display = 'none';
        }
        if (e.target === customerDetailsModal) {
            customerDetailsModal.style.display = 'none';
        }
    });

    // Customer form submission
    customerForm.addEventListener('submit', handleCustomerSubmit);

    // Search functionality
    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadCustomers();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadCustomers();
        }
    });

    // Logout button
    logoutBtn.addEventListener('click', () => {
        window.auth.logout();
    });
}

// Load customers from API
async function loadCustomers() {
    try {
        // Show loading message
        customersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading customers...</td></tr>';

        // Build query parameters
        let queryParams = `?page=${currentPage}&limit=${customersPerPage}`;
        if (currentSearch) {
            queryParams += `&search=${encodeURIComponent(currentSearch)}`;
        }

        // Fetch customers from API
        const response = await fetch(`${API_URL}/customers${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load customers');
        }

        const data = await response.json();
        
        // Update pagination info
        totalPages = Math.ceil(data.total / customersPerPage);
        
        // Clear table
        customersTableBody.innerHTML = '';

        // Check if customers exist
        if (data.customers.length === 0) {
            customersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No customers found</td></tr>';
            return;
        }

        // Populate table with customers
        data.customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.customer_id}</td>
                <td>${customer.name}</td>
                <td>${customer.email || '-'}</td>
                <td>${customer.phone || '-'}</td>
                <td>${customer.address ? customer.address + (customer.city ? ', ' + customer.city : '') : '-'}</td>
                <td>${customer.order_count || 0}</td>
                <td><span class="badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}">${customer.status}</span></td>
                <td>
                    <button class="btn-icon view-customer" data-id="${customer.customer_id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-customer" data-id="${customer.customer_id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-customer" data-id="${customer.customer_id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            // Add event listeners to buttons
            customersTableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        addActionButtonListeners();

        // Update pagination
        updatePagination();

    } catch (error) {
        console.error('Error loading customers:', error);
        customersTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading customers: ${error.message}</td></tr>`;
    }
}

// Add event listeners to action buttons
function addActionButtonListeners() {
    // View customer details
    document.querySelectorAll('.view-customer').forEach(btn => {
        btn.addEventListener('click', () => {
            const customerId = btn.getAttribute('data-id');
            viewCustomerDetails(customerId);
        });
    });

    // Edit customer
    document.querySelectorAll('.edit-customer').forEach(btn => {
        btn.addEventListener('click', () => {
            const customerId = btn.getAttribute('data-id');
            editCustomer(customerId);
        });
    });

    // Delete customer
    document.querySelectorAll('.delete-customer').forEach(btn => {
        btn.addEventListener('click', () => {
            const customerId = btn.getAttribute('data-id');
            deleteCustomer(customerId);
        });
    });
}

// View customer details
async function viewCustomerDetails(customerId) {
    try {
        const response = await fetch(`${API_URL}/customers/${customerId}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load customer details');
        }

        const customer = await response.json();

        // Get customer details modal and content
        const customerDetailsContent = document.getElementById('customerDetailsContent');

        // Format customer details
        customerDetailsContent.innerHTML = `
            <div class="details-container">
                <div class="details-header">
                    <h3>${customer.name}</h3>
                    <span class="badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}">${customer.status}</span>
                </div>
                <div class="details-section">
                    <h4>Contact Information</h4>
                    <div class="details-grid">
                        <div class="details-item">
                            <span class="details-label">Email:</span>
                            <span class="details-value">${customer.email || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Phone:</span>
                            <span class="details-value">${customer.phone || '-'}</span>
                        </div>
                    </div>
                </div>
                <div class="details-section">
                    <h4>Address</h4>
                    <div class="details-grid">
                        <div class="details-item">
                            <span class="details-label">Street:</span>
                            <span class="details-value">${customer.address || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">City:</span>
                            <span class="details-value">${customer.city || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">State:</span>
                            <span class="details-value">${customer.state || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Zip Code:</span>
                            <span class="details-value">${customer.zip_code || '-'}</span>
                        </div>
                    </div>
                </div>
                <div class="details-section">
                    <h4>Orders</h4>
                    <div class="details-item">
                        <span class="details-label">Total Orders:</span>
                        <span class="details-value">${customer.order_count || 0}</span>
                    </div>
                    <div class="details-item">
                        <span class="details-label">Last Order:</span>
                        <span class="details-value">${customer.last_order_date || 'No orders yet'}</span>
                    </div>
                </div>
                <div class="details-section">
                    <h4>Additional Information</h4>
                    <div class="details-item">
                        <span class="details-label">Notes:</span>
                        <span class="details-value">${customer.notes || 'No notes available'}</span>
                    </div>
                </div>
            </div>
        `;

        // Show modal
        customerDetailsModal.style.display = 'block';

    } catch (error) {
        console.error('Error loading customer details:', error);
        alert(`Error: ${error.message}`);
    }
}

// Edit customer
async function editCustomer(customerId) {
    try {
        const response = await fetch(`${API_URL}/customers/${customerId}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load customer details');
        }

        const customer = await response.json();

        // Fill form with customer data
        document.getElementById('customerId').value = customer.customer_id;
        document.getElementById('customerName').value = customer.name || '';
        document.getElementById('customerEmail').value = customer.email || '';
        document.getElementById('customerPhone').value = customer.phone || '';
        document.getElementById('customerAddress').value = customer.address || '';
        document.getElementById('customerCity').value = customer.city || '';
        document.getElementById('customerState').value = customer.state || '';
        document.getElementById('customerZip').value = customer.zip_code || '';
        document.getElementById('customerNotes').value = customer.notes || '';
        document.getElementById('customerStatus').value = customer.status || 'active';

        // Update modal title and show modal
        modalTitle.textContent = 'Edit Customer';
        customerModal.style.display = 'block';

    } catch (error) {
        console.error('Error loading customer for edit:', error);
        alert(`Error: ${error.message}`);
    }
}

// Delete customer
async function deleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        try {
            const response = await fetch(`${API_URL}/customers/${customerId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.auth.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete customer');
            }

            // Reload customers
            loadCustomers();

        } catch (error) {
            console.error('Error deleting customer:', error);
            alert(`Error: ${error.message}`);
        }
    }
}

// Handle customer form submission
async function handleCustomerSubmit(e) {
    e.preventDefault();

    // Get form data
    const customerId = document.getElementById('customerId').value;
    const formData = {
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmail').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        city: document.getElementById('customerCity').value,
        state: document.getElementById('customerState').value,
        zip_code: document.getElementById('customerZip').value,
        notes: document.getElementById('customerNotes').value,
        status: document.getElementById('customerStatus').value
    };

    try {
        let url = `${API_URL}/customers`;
        let method = 'POST';

        // If customerId exists, update existing customer
        if (customerId) {
            url += `/${customerId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.auth.getToken()}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to save customer');
        }

        // Close modal and reload customers
        customerModal.style.display = 'none';
        loadCustomers();

    } catch (error) {
        console.error('Error saving customer:', error);
        alert(`Error: ${error.message}`);
    }
}

// Reset customer form
function resetCustomerForm() {
    document.getElementById('customerId').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerCity').value = '';
    document.getElementById('customerState').value = '';
    document.getElementById('customerZip').value = '';
    document.getElementById('customerNotes').value = '';
    document.getElementById('customerStatus').value = 'active';
}

// Update pagination controls
function updatePagination() {
    if (!customersPagination) return;
    
    customersPagination.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('pagination-btn');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadCustomers();
        }
    });
    customersPagination.appendChild(prevBtn);

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('pagination-btn');
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            loadCustomers();
        });
        customersPagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.classList.add('pagination-btn');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadCustomers();
        }
    });
    customersPagination.appendChild(nextBtn);
}