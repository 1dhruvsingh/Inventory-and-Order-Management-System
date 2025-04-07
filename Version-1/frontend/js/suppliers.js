/**
 * Suppliers JavaScript for handling supplier management
 */

// API URL - Change this to match your backend URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const suppliersTableBody = document.getElementById('suppliersTableBody');
const supplierForm = document.getElementById('supplierForm');
const supplierModal = document.getElementById('supplierModal');
const modalTitle = document.getElementById('modalTitle');
const addSupplierBtn = document.getElementById('addSupplierBtn');
const cancelSupplierBtn = document.getElementById('cancelSupplierBtn');
const searchInput = document.getElementById('searchSupplier');
const searchBtn = document.getElementById('searchBtn');
const statusFilter = document.getElementById('statusFilter');
const suppliersPagination = document.getElementById('suppliersPagination');
const logoutBtn = document.getElementById('logoutBtn');

// State variables
let currentPage = 1;
let totalPages = 1;
let suppliersPerPage = 10;
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

    // Load initial data
    loadSuppliers();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add supplier button
    addSupplierBtn.addEventListener('click', () => {
        resetSupplierForm();
        modalTitle.textContent = 'Add New Supplier';
        supplierModal.style.display = 'block';
    });

    // Cancel button in modal
    cancelSupplierBtn.addEventListener('click', () => {
        supplierModal.style.display = 'none';
    });

    // Close modal when clicking on X
    document.querySelector('.close-modal').addEventListener('click', () => {
        supplierModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === supplierModal) {
            supplierModal.style.display = 'none';
        }
    });

    // Supplier form submission
    supplierForm.addEventListener('submit', handleSupplierSubmit);

    // Search functionality
    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadSuppliers();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadSuppliers();
        }
    });

    // Status filter
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            currentFilter = statusFilter.value;
            currentPage = 1;
            loadSuppliers();
        });
    }

    // Logout button
    logoutBtn.addEventListener('click', () => {
        window.auth.logout();
    });
}

// Load suppliers from API
async function loadSuppliers() {
    try {
        // Show loading message
        suppliersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading suppliers...</td></tr>';

        // Build query parameters
        let queryParams = `?page=${currentPage}&limit=${suppliersPerPage}`;
        if (currentSearch) {
            queryParams += `&search=${encodeURIComponent(currentSearch)}`;
        }
        if (currentFilter) {
            queryParams += `&status=${encodeURIComponent(currentFilter)}`;
        }

        // Fetch suppliers from API
        const response = await fetch(`${API_URL}/suppliers${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load suppliers');
        }

        const data = await response.json();
        
        // Update pagination info
        totalPages = Math.ceil(data.total / suppliersPerPage);
        
        // Clear table
        suppliersTableBody.innerHTML = '';

        // Check if suppliers exist
        if (data.suppliers.length === 0) {
            suppliersTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No suppliers found</td></tr>';
            return;
        }

        // Populate table with suppliers
        data.suppliers.forEach(supplier => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${supplier.supplier_id}</td>
                <td>${supplier.company_name}</td>
                <td>${supplier.contact_name || '-'}</td>
                <td>${supplier.email || '-'}</td>
                <td>${supplier.phone || '-'}</td>
                <td>${supplier.product_count || 0}</td>
                <td><span class="badge ${supplier.status === 'active' ? 'badge-success' : 'badge-danger'}">${supplier.status}</span></td>
                <td>
                    <button class="btn-icon view-supplier" data-id="${supplier.supplier_id}" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon edit-supplier" data-id="${supplier.supplier_id}" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete-supplier" data-id="${supplier.supplier_id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            // Add event listeners to buttons
            suppliersTableBody.appendChild(row);
        });

        // Add event listeners to action buttons
        addActionButtonListeners();

        // Update pagination
        updatePagination();

    } catch (error) {
        console.error('Error loading suppliers:', error);
        suppliersTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading suppliers: ${error.message}</td></tr>`;
    }
}

// Add event listeners to action buttons
function addActionButtonListeners() {
    // View supplier details
    document.querySelectorAll('.view-supplier').forEach(btn => {
        btn.addEventListener('click', () => {
            const supplierId = btn.getAttribute('data-id');
            viewSupplierDetails(supplierId);
        });
    });

    // Edit supplier
    document.querySelectorAll('.edit-supplier').forEach(btn => {
        btn.addEventListener('click', () => {
            const supplierId = btn.getAttribute('data-id');
            editSupplier(supplierId);
        });
    });

    // Delete supplier
    document.querySelectorAll('.delete-supplier').forEach(btn => {
        btn.addEventListener('click', () => {
            const supplierId = btn.getAttribute('data-id');
            deleteSupplier(supplierId);
        });
    });
}

// View supplier details
async function viewSupplierDetails(supplierId) {
    try {
        const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load supplier details');
        }

        const supplier = await response.json();

        // Get supplier details modal and content
        const supplierDetailsModal = document.getElementById('supplierDetailsModal');
        const supplierDetailsContent = document.getElementById('supplierDetailsContent');

        // Format supplier details
        supplierDetailsContent.innerHTML = `
            <div class="details-container">
                <div class="details-header">
                    <h3>${supplier.company_name}</h3>
                    <span class="badge ${supplier.status === 'active' ? 'badge-success' : 'badge-danger'}">${supplier.status}</span>
                </div>
                <div class="details-section">
                    <h4>Contact Information</h4>
                    <div class="details-grid">
                        <div class="details-item">
                            <span class="details-label">Contact Person:</span>
                            <span class="details-value">${supplier.contact_name || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Email:</span>
                            <span class="details-value">${supplier.email || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Phone:</span>
                            <span class="details-value">${supplier.phone || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Website:</span>
                            <span class="details-value">${supplier.website ? `<a href="${supplier.website}" target="_blank">${supplier.website}</a>` : '-'}</span>
                        </div>
                    </div>
                </div>
                <div class="details-section">
                    <h4>Address</h4>
                    <div class="details-grid">
                        <div class="details-item">
                            <span class="details-label">Street:</span>
                            <span class="details-value">${supplier.address || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">City:</span>
                            <span class="details-value">${supplier.city || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">State:</span>
                            <span class="details-value">${supplier.state || '-'}</span>
                        </div>
                        <div class="details-item">
                            <span class="details-label">Zip Code:</span>
                            <span class="details-value">${supplier.zip_code || '-'}</span>
                        </div>
                    </div>
                </div>
                <div class="details-section">
                    <h4>Additional Information</h4>
                    <div class="details-item">
                        <span class="details-label">Notes:</span>
                        <span class="details-value">${supplier.notes || 'No notes available'}</span>
                    </div>
                </div>
            </div>
        `;

        // Show modal
        supplierDetailsModal.style.display = 'block';

    } catch (error) {
        console.error('Error loading supplier details:', error);
        alert(`Error: ${error.message}`);
    }
}

// Edit supplier
async function editSupplier(supplierId) {
    try {
        const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load supplier details');
        }

        const supplier = await response.json();

        // Fill form with supplier data
        document.getElementById('supplierId').value = supplier.supplier_id;
        document.getElementById('companyName').value = supplier.company_name || '';
        document.getElementById('contactName').value = supplier.contact_name || '';
        document.getElementById('supplierEmail').value = supplier.email || '';
        document.getElementById('supplierPhone').value = supplier.phone || '';
        document.getElementById('supplierAddress').value = supplier.address || '';
        document.getElementById('supplierCity').value = supplier.city || '';
        document.getElementById('supplierState').value = supplier.state || '';
        document.getElementById('supplierZip').value = supplier.zip_code || '';
        document.getElementById('supplierWebsite').value = supplier.website || '';
        document.getElementById('supplierNotes').value = supplier.notes || '';
        document.getElementById('supplierStatus').value = supplier.status || 'active';

        // Update modal title and show modal
        modalTitle.textContent = 'Edit Supplier';
        supplierModal.style.display = 'block';

    } catch (error) {
        console.error('Error loading supplier for edit:', error);
        alert(`Error: ${error.message}`);
    }
}

// Delete supplier
async function deleteSupplier(supplierId) {
    if (confirm('Are you sure you want to delete this supplier?')) {
        try {
            const response = await fetch(`${API_URL}/suppliers/${supplierId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${window.auth.getToken()}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete supplier');
            }

            // Reload suppliers
            loadSuppliers();

        } catch (error) {
            console.error('Error deleting supplier:', error);
            alert(`Error: ${error.message}`);
        }
    }
}

// Handle supplier form submission
async function handleSupplierSubmit(e) {
    e.preventDefault();

    // Get form data
    const supplierId = document.getElementById('supplierId').value;
    const formData = {
        company_name: document.getElementById('companyName').value,
        contact_name: document.getElementById('contactName').value,
        email: document.getElementById('supplierEmail').value,
        phone: document.getElementById('supplierPhone').value,
        address: document.getElementById('supplierAddress').value,
        city: document.getElementById('supplierCity').value,
        state: document.getElementById('supplierState').value,
        zip_code: document.getElementById('supplierZip').value,
        website: document.getElementById('supplierWebsite').value,
        notes: document.getElementById('supplierNotes').value,
        status: document.getElementById('supplierStatus').value
    };

    try {
        let url = `${API_URL}/suppliers`;
        let method = 'POST';

        // If supplierId exists, update existing supplier
        if (supplierId) {
            url += `/${supplierId}`;
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
            throw new Error('Failed to save supplier');
        }

        // Close modal and reload suppliers
        supplierModal.style.display = 'none';
        loadSuppliers();

    } catch (error) {
        console.error('Error saving supplier:', error);
        alert(`Error: ${error.message}`);
    }
}

// Reset supplier form
function resetSupplierForm() {
    document.getElementById('supplierId').value = '';
    document.getElementById('companyName').value = '';
    document.getElementById('contactName').value = '';
    document.getElementById('supplierEmail').value = '';
    document.getElementById('supplierPhone').value = '';
    document.getElementById('supplierAddress').value = '';
    document.getElementById('supplierCity').value = '';
    document.getElementById('supplierState').value = '';
    document.getElementById('supplierZip').value = '';
    document.getElementById('supplierWebsite').value = '';
    document.getElementById('supplierNotes').value = '';
    document.getElementById('supplierStatus').value = 'active';
}

// Update pagination controls
function updatePagination() {
    if (!suppliersPagination) return;
    
    suppliersPagination.innerHTML = '';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.classList.add('pagination-btn');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadSuppliers();
        }
    });
    suppliersPagination.appendChild(prevBtn);

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
            loadSuppliers();
        });
        suppliersPagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.classList.add('pagination-btn');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadSuppliers();
        }
    });
    suppliersPagination.appendChild(nextBtn);
}