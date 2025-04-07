/**
 * Products JavaScript for handling product management
 */

// API URL - Change this to match your backend URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const productsTableBody = document.getElementById('productsTableBody');
const productForm = document.getElementById('productForm');
const productModal = document.getElementById('productModal');
const modalTitle = document.getElementById('modalTitle');
const addProductBtn = document.getElementById('addProductBtn');
const cancelProductBtn = document.getElementById('cancelProductBtn');
const searchInput = document.getElementById('searchProduct');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const productsPagination = document.getElementById('productsPagination');
const logoutBtn = document.getElementById('logoutBtn');

// State variables
let currentPage = 1;
let totalPages = 1;
let productsPerPage = 10;
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
    loadProducts();
    loadCategories();
    loadSuppliers();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Add product button
    addProductBtn.addEventListener('click', () => {
        resetProductForm();
        modalTitle.textContent = 'Add New Product';
        productModal.style.display = 'block';
    });

    // Cancel button in modal
    cancelProductBtn.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    // Close modal when clicking on X
    document.querySelector('.close-modal').addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });

    // Product form submission
    productForm.addEventListener('submit', handleProductSubmit);

    // Search functionality
    searchBtn.addEventListener('click', () => {
        currentSearch = searchInput.value.trim();
        currentPage = 1;
        loadProducts();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            currentSearch = searchInput.value.trim();
            currentPage = 1;
            loadProducts();
        }
    });

    // Category filter
    categoryFilter.addEventListener('change', () => {
        currentFilter = categoryFilter.value;
        currentPage = 1;
        loadProducts();
    });

    // Logout button
    logoutBtn.addEventListener('click', () => {
        window.auth.logout();
    });
}

// Load products from API
async function loadProducts() {
    try {
        // Show loading state
        productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading products...</td></tr>';

        // Build query parameters
        let queryParams = `?page=${currentPage}&limit=${productsPerPage}`;
        if (currentSearch) {
            queryParams += `&search=${encodeURIComponent(currentSearch)}`;
        }
        if (currentFilter) {
            queryParams += `&category=${encodeURIComponent(currentFilter)}`;
        }

        // Fetch products from API
        const response = await fetch(`${API_URL}/products${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load products');
        }

        const data = await response.json();
        
        // Update pagination
        totalPages = Math.ceil(data.total / productsPerPage);
        updatePagination();

        // Clear table
        productsTableBody.innerHTML = '';

        // Check if no products found
        if (data.products.length === 0) {
            productsTableBody.innerHTML = '<tr><td colspan="8" class="text-center">No products found</td></tr>';
            return;
        }

        // Render products
        data.products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.product_id}</td>
                <td>${product.name}</td>
                <td>${product.category_name || 'N/A'}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>
                    <span class="${product.stock_quantity <= product.reorder_level ? 'text-danger' : ''}">
                        ${product.stock_quantity}
                    </span>
                </td>
                <td>${product.supplier_name || 'N/A'}</td>
                <td>
                    <span class="badge ${product.status === 'active' ? 'badge-success' : 'badge-danger'}">
                        ${product.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit-product" data-id="${product.product_id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon delete-product" data-id="${product.product_id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;

            // Add event listeners to action buttons
            productsTableBody.appendChild(row);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-product').forEach(button => {
            button.addEventListener('click', () => editProduct(button.dataset.id));
        });

        document.querySelectorAll('.delete-product').forEach(button => {
            button.addEventListener('click', () => deleteProduct(button.dataset.id));
        });

    } catch (error) {
        console.error('Error loading products:', error);
        productsTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error loading products: ${error.message}</td></tr>`;
    }
}

// Load categories for dropdown
async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/products/categories`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load categories');
        }

        const categories = await response.json();

        // Populate category filter dropdown
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category_id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });

        // Populate category dropdown in form
        const productCategory = document.getElementById('productCategory');
        productCategory.innerHTML = '<option value="">Select Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category_id;
            option.textContent = category.name;
            productCategory.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load suppliers for dropdown
async function loadSuppliers() {
    try {
        const response = await fetch(`${API_URL}/suppliers`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load suppliers');
        }

        const suppliers = await response.json();

        // Populate supplier dropdown in form
        const productSupplier = document.getElementById('productSupplier');
        productSupplier.innerHTML = '<option value="">Select Supplier</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement('option');
            option.value = supplier.supplier_id;
            option.textContent = supplier.name;
            productSupplier.appendChild(option);
        });

    } catch (error) {
        console.error('Error loading suppliers:', error);
    }
}

// Update pagination controls
function updatePagination() {
    productsPagination.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.classList.add('pagination-btn');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProducts();
        }
    });
    productsPagination.appendChild(prevButton);

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
            loadProducts();
        });
        productsPagination.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.classList.add('pagination-btn');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadProducts();
        }
    });
    productsPagination.appendChild(nextButton);
}

// Handle product form submission
async function handleProductSubmit(e) {
    e.preventDefault();

    try {
        const productId = document.getElementById('productId').value;
        const isEditing = !!productId;

        // Get form data
        const formData = {
            name: document.getElementById('productName').value,
            category_id: document.getElementById('productCategory').value,
            description: document.getElementById('productDescription').value,
            price: parseFloat(document.getElementById('productPrice').value),
            cost: parseFloat(document.getElementById('productCost').value),
            stock_quantity: parseInt(document.getElementById('productStock').value),
            reorder_level: parseInt(document.getElementById('productReorderLevel').value),
            supplier_id: document.getElementById('productSupplier').value,
            status: document.getElementById('productStatus').value
        };

        // API endpoint and method
        const url = isEditing ? `${API_URL}/products/${productId}` : `${API_URL}/products`;
        const method = isEditing ? 'PUT' : 'POST';

        // Send request to API
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${window.auth.getToken()}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save product');
        }

        // Close modal and reload products
        productModal.style.display = 'none';
        loadProducts();

        // Show success message (you can implement a toast notification here)
        alert(isEditing ? 'Product updated successfully' : 'Product added successfully');

    } catch (error) {
        console.error('Error saving product:', error);
        alert(`Error: ${error.message}`);
    }
}

// Edit product
async function editProduct(productId) {
    try {
        // Fetch product details
        const response = await fetch(`${API_URL}/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch product details');
        }

        const product = await response.json();

        // Populate form with product details
        document.getElementById('productId').value = product.product_id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category_id || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCost').value = product.cost;
        document.getElementById('productStock').value = product.stock_quantity;
        document.getElementById('productReorderLevel').value = product.reorder_level;
        document.getElementById('productSupplier').value = product.supplier_id || '';
        document.getElementById('productStatus').value = product.status;

        // Update modal title and show modal
        modalTitle.textContent = 'Edit Product';
        productModal.style.display = 'block';

    } catch (error) {
        console.error('Error fetching product details:', error);
        alert(`Error: ${error.message}`);
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete product');
        }

        // Reload products
        loadProducts();
        alert('Product deleted successfully');

    } catch (error) {
        console.error('Error deleting product:', error);
        alert(`Error: ${error.message}`);
    }
}

// Reset product form
function resetProductForm() {
    document.getElementById('productId').value = '';
    document.getElementById('productName').value = '';
    document.getElementById('productCategory').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productCost').value = '';
    document.getElementById('productStock').value = '';
    document.getElementById('productReorderLevel').value = '';
    document.getElementById('productSupplier').value = '';
    document.getElementById('productStatus').value = 'active';
}