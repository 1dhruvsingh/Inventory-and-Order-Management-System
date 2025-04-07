/**
 * Dashboard JavaScript for handling dashboard functionality
 */

// API URL - Change this to match your backend URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const recentOrdersTableBody = document.getElementById('recentOrdersTableBody');
const lowStockTableBody = document.getElementById('lowStockTableBody');
const topProductsTableBody = document.getElementById('topProductsTableBody');
const recentActivitiesContainer = document.getElementById('recentActivitiesContainer');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard statistics elements
const totalOrdersValue = document.getElementById('totalOrdersValue');
const totalRevenueValue = document.getElementById('totalRevenueValue');
const totalCustomersValue = document.getElementById('totalCustomersValue');
const totalProductsValue = document.getElementById('totalProductsValue');

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

    // Load dashboard data
    loadDashboardData();

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Logout button
    logoutBtn.addEventListener('click', () => {
        window.auth.logout();
    });

    // Refresh button
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadDashboardData();
        });
    }
}

// Load dashboard data from API
async function loadDashboardData() {
    try {
        // Show loading indicators
        showLoadingState();

        // Fetch dashboard data from API
        const response = await fetch(`${API_URL}/reports/dashboard`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }

        const data = await response.json();
        
        // Update dashboard with data
        updateDashboardStatistics(data.statistics);
        updateRecentOrders(data.recent_orders);
        updateLowStockProducts(data.low_stock_products);
        updateTopProducts(data.top_products);
        updateRecentActivities(data.recent_activities);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorState(error.message);
    }
}

// Show loading state for dashboard elements
function showLoadingState() {
    // Statistics
    totalOrdersValue.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    totalRevenueValue.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    totalCustomersValue.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    totalProductsValue.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    // Tables
    recentOrdersTableBody.innerHTML = '<tr><td colspan="5" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    lowStockTableBody.innerHTML = '<tr><td colspan="4" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    topProductsTableBody.innerHTML = '<tr><td colspan="4" class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';
    
    // Activities
    recentActivitiesContainer.innerHTML = '<div class="text-center"><i class="fas fa-spinner fa-spin"></i> Loading activities...</div>';
}

// Show error state for dashboard elements
function showErrorState(errorMessage) {
    // Statistics
    totalOrdersValue.textContent = 'Error';
    totalRevenueValue.textContent = 'Error';
    totalCustomersValue.textContent = 'Error';
    totalProductsValue.textContent = 'Error';

    // Tables
    const errorCell = `<tr><td colspan="5" class="text-center text-danger">Error: ${errorMessage}</td></tr>`;
    recentOrdersTableBody.innerHTML = errorCell;
    lowStockTableBody.innerHTML = errorCell;
    topProductsTableBody.innerHTML = errorCell;
    
    // Activities
    recentActivitiesContainer.innerHTML = `<div class="text-center text-danger">Error loading activities: ${errorMessage}</div>`;
}

// Update dashboard statistics
function updateDashboardStatistics(statistics) {
    totalOrdersValue.textContent = statistics.total_orders;
    totalRevenueValue.textContent = `$${statistics.total_revenue.toFixed(2)}`;
    totalCustomersValue.textContent = statistics.total_customers;
    totalProductsValue.textContent = statistics.total_products;

    // Update trend indicators if available
    if (statistics.order_trend) {
        const orderTrend = document.getElementById('orderTrend');
        if (orderTrend) {
            const trendValue = statistics.order_trend;
            orderTrend.innerHTML = getTrendHTML(trendValue);
        }
    }

    if (statistics.revenue_trend) {
        const revenueTrend = document.getElementById('revenueTrend');
        if (revenueTrend) {
            const trendValue = statistics.revenue_trend;
            revenueTrend.innerHTML = getTrendHTML(trendValue);
        }
    }
}

// Get HTML for trend indicator
function getTrendHTML(trendValue) {
    if (trendValue > 0) {
        return `<span class="trend-up"><i class="fas fa-arrow-up"></i> ${trendValue}%</span>`;
    } else if (trendValue < 0) {
        return `<span class="trend-down"><i class="fas fa-arrow-down"></i> ${Math.abs(trendValue)}%</span>`;
    } else {
        return `<span class="trend-neutral"><i class="fas fa-minus"></i> 0%</span>`;
    }
}

// Update recent orders table
function updateRecentOrders(orders) {
    if (!recentOrdersTableBody) return;
    
    recentOrdersTableBody.innerHTML = '';

    if (orders.length === 0) {
        recentOrdersTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No recent orders</td></tr>';
        return;
    }

    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.order_id}</td>
            <td>${order.customer_name}</td>
            <td>${formatDate(order.order_date)}</td>
            <td>$${order.total_amount.toFixed(2)}</td>
            <td>
                <span class="badge ${getOrderStatusClass(order.status)}">
                    ${order.status}
                </span>
            </td>
        `;
        recentOrdersTableBody.appendChild(row);
    });
}

// Update low stock products table
function updateLowStockProducts(products) {
    if (!lowStockTableBody) return;
    
    lowStockTableBody.innerHTML = '';

    if (products.length === 0) {
        lowStockTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No low stock products</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.product_name}</td>
            <td>${product.current_stock}</td>
            <td>${product.reorder_point}</td>
            <td>
                <a href="products.html" class="btn-sm btn-primary">Restock</a>
            </td>
        `;
        lowStockTableBody.appendChild(row);
    });
}

// Update top products table
function updateTopProducts(products) {
    if (!topProductsTableBody) return;
    
    topProductsTableBody.innerHTML = '';

    if (products.length === 0) {
        topProductsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No product data available</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.product_name}</td>
            <td>${product.units_sold}</td>
            <td>$${product.revenue.toFixed(2)}</td>
            <td>
                <div class="progress">
                    <div class="progress-bar" style="width: ${product.percentage}%" role="progressbar" aria-valuenow="${product.percentage}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </td>
        `;
        topProductsTableBody.appendChild(row);
    });
}

// Update recent activities
function updateRecentActivities(activities) {
    if (!recentActivitiesContainer) return;
    
    recentActivitiesContainer.innerHTML = '';

    if (activities.length === 0) {
        recentActivitiesContainer.innerHTML = '<div class="text-center">No recent activities</div>';
        return;
    }

    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Get icon based on activity type
        const icon = getActivityIcon(activity.type);
        
        activityItem.innerHTML = `
            <div class="activity-icon ${getActivityIconClass(activity.type)}">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.description}</div>
                <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
            </div>
        `;
        
        recentActivitiesContainer.appendChild(activityItem);
    });
}

// Get icon for activity type
function getActivityIcon(type) {
    const icons = {
        'order': 'fas fa-shopping-cart',
        'product': 'fas fa-box',
        'customer': 'fas fa-user',
        'payment': 'fas fa-credit-card',
        'stock': 'fas fa-warehouse',
        'user': 'fas fa-user-shield'
    };
    
    return icons[type] || 'fas fa-bell';
}

// Get icon class for activity type
function getActivityIconClass(type) {
    const classes = {
        'order': 'bg-primary',
        'product': 'bg-success',
        'customer': 'bg-info',
        'payment': 'bg-warning',
        'stock': 'bg-danger',
        'user': 'bg-secondary'
    };
    
    return classes[type] || 'bg-primary';
}

// Get CSS class for order status
function getOrderStatusClass(status) {
    const classes = {
        'pending': 'badge-warning',
        'processing': 'badge-info',
        'shipped': 'badge-primary',
        'delivered': 'badge-success',
        'cancelled': 'badge-danger'
    };
    
    return classes[status] || 'badge-secondary';
}

// Format date (YYYY-MM-DD to MM/DD/YYYY)
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Format time ago (e.g., "2 hours ago")
function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval === 1 ? '1 year ago' : `${interval} years ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval === 1 ? '1 month ago' : `${interval} months ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval === 1 ? '1 day ago' : `${interval} days ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
    }
    
    return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
}