/**
 * Reports JavaScript for handling report generation and display
 */

// API URL - Change this to match your backend URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const reportType = document.getElementById('reportType');
const dateRange = document.getElementById('dateRange');
const customDateRange = document.getElementById('customDateRange');
const startDate = document.getElementById('startDate');
const endDate = document.getElementById('endDate');
const generateReportBtn = document.getElementById('generateReportBtn');
const exportReportBtn = document.getElementById('exportReportBtn');
const reportResultsCard = document.getElementById('reportResultsCard');
const reportTitle = document.getElementById('reportTitle');
const reportTableHead = document.getElementById('reportTableHead');
const reportTableBody = document.getElementById('reportTableBody');
const logoutBtn = document.getElementById('logoutBtn');

// Chart elements
let reportChart = null;

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

    // Set default dates
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    startDate.value = formatDate(firstDayOfMonth);
    endDate.value = formatDate(today);

    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Date range change
    dateRange.addEventListener('change', () => {
        if (dateRange.value === 'custom') {
            customDateRange.style.display = 'flex';
        } else {
            customDateRange.style.display = 'none';
            setDateRangeValues(dateRange.value);
        }
    });

    // Generate report button
    generateReportBtn.addEventListener('click', generateReport);

    // Export report button
    exportReportBtn.addEventListener('click', exportReport);

    // Logout button
    logoutBtn.addEventListener('click', () => {
        window.auth.logout();
    });
}

// Set date range values based on selection
function setDateRangeValues(range) {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
        case 'today':
            start = today;
            end = today;
            break;
        case 'yesterday':
            start = new Date(today);
            start.setDate(today.getDate() - 1);
            end = start;
            break;
        case 'thisWeek':
            start = new Date(today);
            start.setDate(today.getDate() - today.getDay());
            end = today;
            break;
        case 'lastWeek':
            start = new Date(today);
            start.setDate(today.getDate() - today.getDay() - 7);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            break;
        case 'thisMonth':
            start = new Date(today.getFullYear(), today.getMonth(), 1);
            end = today;
            break;
        case 'lastMonth':
            start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            end = new Date(today.getFullYear(), today.getMonth(), 0);
            break;
        case 'thisYear':
            start = new Date(today.getFullYear(), 0, 1);
            end = today;
            break;
    }

    startDate.value = formatDate(start);
    endDate.value = formatDate(end);
}

// Format date to YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Generate report
async function generateReport() {
    try {
        // Get report parameters
        const type = reportType.value;
        const start = startDate.value;
        const end = endDate.value;

        // Validate dates
        if (new Date(start) > new Date(end)) {
            alert('Start date cannot be after end date');
            return;
        }

        // Show loading state
        generateReportBtn.disabled = true;
        generateReportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        // Fetch report data from API
        const response = await fetch(`${API_URL}/reports/${type}?start_date=${start}&end_date=${end}`, {
            headers: {
                'Authorization': `Bearer ${window.auth.getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to generate report');
        }

        const reportData = await response.json();

        // Display report results
        displayReportResults(type, reportData, start, end);

        // Enable export button
        exportReportBtn.disabled = false;

    } catch (error) {
        console.error('Error generating report:', error);
        alert(`Error: ${error.message}`);
    } finally {
        // Reset button state
        generateReportBtn.disabled = false;
        generateReportBtn.innerHTML = '<i class="fas fa-file-alt"></i> Generate Report';
    }
}

// Display report results
function displayReportResults(type, data, startDate, endDate) {
    // Show results card
    reportResultsCard.style.display = 'block';

    // Set report title based on type
    const titles = {
        'sales': 'Sales Report',
        'inventory': 'Inventory Status Report',
        'products': 'Product Performance Report',
        'customers': 'Customer Activity Report',
        'suppliers': 'Supplier Performance Report',
        'payments': 'Payment Summary Report'
    };

    reportTitle.textContent = `${titles[type]} (${formatDateForDisplay(startDate)} - ${formatDateForDisplay(endDate)})`;

    // Update summary cards
    updateSummaryCards(type, data);

    // Generate chart
    generateChart(type, data);

    // Generate table
    generateTable(type, data);
}

// Format date for display (MM/DD/YYYY)
function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

// Update summary cards with report data
function updateSummaryCards(type, data) {
    const totalRevenue = document.getElementById('totalRevenue');
    const totalOrders = document.getElementById('totalOrders');
    const productsSold = document.getElementById('productsSold');
    const growthRate = document.getElementById('growthRate');

    // Set values based on report type
    switch (type) {
        case 'sales':
            totalRevenue.textContent = `$${data.summary.total_revenue.toFixed(2)}`;
            totalOrders.textContent = data.summary.total_orders;
            productsSold.textContent = data.summary.total_products_sold;
            growthRate.textContent = `${data.summary.growth_rate.toFixed(2)}%`;
            break;
        case 'inventory':
            totalRevenue.textContent = `$${data.summary.inventory_value.toFixed(2)}`;
            totalOrders.textContent = data.summary.pending_orders;
            productsSold.textContent = data.summary.total_products;
            growthRate.textContent = `${data.summary.stock_change.toFixed(2)}%`;
            break;
        case 'products':
            totalRevenue.textContent = `$${data.summary.total_revenue.toFixed(2)}`;
            totalOrders.textContent = data.summary.total_products;
            productsSold.textContent = data.summary.total_sold;
            growthRate.textContent = `${data.summary.top_product_growth.toFixed(2)}%`;
            break;
        case 'customers':
            totalRevenue.textContent = `$${data.summary.total_revenue.toFixed(2)}`;
            totalOrders.textContent = data.summary.total_customers;
            productsSold.textContent = data.summary.new_customers;
            growthRate.textContent = `${data.summary.customer_growth.toFixed(2)}%`;
            break;
        case 'suppliers':
            totalRevenue.textContent = `$${data.summary.total_cost.toFixed(2)}`;
            totalOrders.textContent = data.summary.total_suppliers;
            productsSold.textContent = data.summary.active_suppliers;
            growthRate.textContent = `${data.summary.delivery_rate.toFixed(2)}%`;
            break;
        case 'payments':
            totalRevenue.textContent = `$${data.summary.total_amount.toFixed(2)}`;
            totalOrders.textContent = data.summary.total_payments;
            productsSold.textContent = data.summary.pending_payments;
            growthRate.textContent = `${data.summary.payment_growth.toFixed(2)}%`;
            break;
    }
}

// Generate chart based on report type and data
function generateChart(type, data) {
    // Get the canvas element
    const ctx = document.getElementById('reportChart').getContext('2d');

    // Destroy existing chart if it exists
    if (reportChart) {
        reportChart.destroy();
    }

    // Prepare chart data based on report type
    let chartData = {};
    let chartType = 'bar';

    switch (type) {
        case 'sales':
            chartData = {
                labels: data.chart_data.map(item => item.date),
                datasets: [{
                    label: 'Revenue',
                    data: data.chart_data.map(item => item.revenue),
                    backgroundColor: 'rgba(67, 97, 238, 0.6)',
                    borderColor: 'rgba(67, 97, 238, 1)',
                    borderWidth: 1
                }]
            };
            break;
        case 'inventory':
            chartData = {
                labels: data.chart_data.map(item => item.category),
                datasets: [{
                    label: 'Stock Level',
                    data: data.chart_data.map(item => item.stock_level),
                    backgroundColor: data.chart_data.map(item => 
                        item.stock_level < item.reorder_point ? 'rgba(244, 67, 54, 0.6)' : 'rgba(76, 201, 240, 0.6)'
                    ),
                    borderColor: data.chart_data.map(item => 
                        item.stock_level < item.reorder_point ? 'rgba(244, 67, 54, 1)' : 'rgba(76, 201, 240, 1)'
                    ),
                    borderWidth: 1
                }]
            };
            break;
        case 'products':
            chartData = {
                labels: data.chart_data.map(item => item.product_name),
                datasets: [{
                    label: 'Units Sold',
                    data: data.chart_data.map(item => item.units_sold),
                    backgroundColor: 'rgba(76, 175, 80, 0.6)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 1
                }]
            };
            break;
        case 'customers':
            chartData = {
                labels: data.chart_data.map(item => item.month),
                datasets: [{
                    label: 'New Customers',
                    data: data.chart_data.map(item => item.new_customers),
                    backgroundColor: 'rgba(63, 55, 201, 0.6)',
                    borderColor: 'rgba(63, 55, 201, 1)',
                    borderWidth: 1,
                    type: 'bar'
                }, {
                    label: 'Total Orders',
                    data: data.chart_data.map(item => item.orders),
                    borderColor: 'rgba(255, 152, 0, 1)',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    borderWidth: 2,
                    type: 'line',
                    fill: false
                }]
            };
            chartType = 'bar';
            break;
        case 'suppliers':
            chartData = {
                labels: data.chart_data.map(item => item.supplier_name),
                datasets: [{
                    label: 'On-Time Delivery Rate',
                    data: data.chart_data.map(item => item.on_time_rate),
                    backgroundColor: 'rgba(76, 201, 240, 0.6)',
                    borderColor: 'rgba(76, 201, 240, 1)',
                    borderWidth: 1
                }]
            };
            break;
        case 'payments':
            chartData = {
                labels: data.chart_data.map(item => item.payment_method),
                datasets: [{
                    label: 'Amount',
                    data: data.chart_data.map(item => item.amount),
                    backgroundColor: [
                        'rgba(67, 97, 238, 0.6)',
                        'rgba(76, 201, 240, 0.6)',
                        'rgba(76, 175, 80, 0.6)',
                        'rgba(255, 152, 0, 0.6)',
                        'rgba(244, 67, 54, 0.6)'
                    ],
                    borderColor: [
                        'rgba(67, 97, 238, 1)',
                        'rgba(76, 201, 240, 1)',
                        'rgba(76, 175, 80, 1)',
                        'rgba(255, 152, 0, 1)',
                        'rgba(244, 67, 54, 1)'
                    ],
                    borderWidth: 1
                }]
            };
            chartType = 'pie';
            break;
    }

    // Create chart
    reportChart = new Chart(ctx, {
        type: chartType,
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: chartType !== 'pie' ? {
                y: {
                    beginAtZero: true
                }
            } : undefined
        }
    });
}

// Generate table based on report type and data
function generateTable(type, data) {
    // Define table headers based on report type
    const headers = {
        'sales': ['Date', 'Orders', 'Revenue', 'Items Sold', 'Avg. Order Value'],
        'inventory': ['Product', 'Category', 'Stock Level', 'Reorder Point', 'Status'],
        'products': ['Product', 'Category', 'Units Sold', 'Revenue', 'Profit Margin'],
        'customers': ['Customer', 'Orders', 'Total Spent', 'Last Order Date', 'Status'],
        'suppliers': ['Supplier', 'Products', 'Orders', 'On-Time Rate', 'Status'],
        'payments': ['Date', 'Order ID', 'Customer', 'Amount', 'Method', 'Status']
    };

    // Set table headers
    let headerRow = '<tr>';
    headers[type].forEach(header => {
        headerRow += `<th>${header}</th>`;
    });
    headerRow += '</tr>';
    reportTableHead.innerHTML = headerRow;

    // Clear table body
    reportTableBody.innerHTML = '';

    // Add table rows based on report type
    if (data.table_data && data.table_data.length > 0) {
        data.table_data.forEach(item => {
            let row = document.createElement('tr');

            switch (type) {
                case 'sales':
                    row.innerHTML = `
                        <td>${item.date}</td>
                        <td>${item.orders}</td>
                        <td>$${item.revenue.toFixed(2)}</td>
                        <td>${item.items_sold}</td>
                        <td>$${item.avg_order_value.toFixed(2)}</td>
                    `;
                    break;
                case 'inventory':
                    row.innerHTML = `
                        <td>${item.product_name}</td>
                        <td>${item.category}</td>
                        <td>${item.stock_level}</td>
                        <td>${item.reorder_point}</td>
                        <td>
                            <span class="badge ${item.stock_level < item.reorder_point ? 'badge-danger' : 'badge-success'}">
                                ${item.stock_level < item.reorder_point ? 'Low Stock' : 'In Stock'}
                            </span>
                        </td>
                    `;
                    break;
                case 'products':
                    row.innerHTML = `
                        <td>${item.product_name}</td>
                        <td>${item.category}</td>
                        <td>${item.units_sold}</td>
                        <td>$${item.revenue.toFixed(2)}</td>
                        <td>${item.profit_margin.toFixed(2)}%</td>
                    `;
                    break;
                case 'customers':
                    row.innerHTML = `
                        <td>${item.customer_name}</td>
                        <td>${item.orders}</td>
                        <td>$${item.total_spent.toFixed(2)}</td>
                        <td>${item.last_order_date}</td>
                        <td>
                            <span class="badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}">
                                ${item.status}
                            </span>
                        </td>
                    `;
                    break;
                case 'suppliers':
                    row.innerHTML = `
                        <td>${item.supplier_name}</td>
                        <td>${item.products}</td>
                        <td>${item.orders}</td>
                        <td>${item.on_time_rate.toFixed(2)}%</td>
                        <td>
                            <span class="badge ${item.status === 'active' ? 'badge-success' : 'badge-danger'}">
                                ${item.status}
                            </span>
                        </td>
                    `;
                    break;
                case 'payments':
                    row.innerHTML = `
                        <td>${item.date}</td>
                        <td>${item.order_id}</td>
                        <td>${item.customer_name}</td>
                        <td>$${item.amount.toFixed(2)}</td>
                        <td>${formatPaymentMethod(item.payment_method)}</td>
                        <td>
                            <span class="badge ${getPaymentStatusClass(item.status)}">
                                ${item.status}
                            </span>
                        </td>
                    `;
                    break;
            }

            reportTableBody.appendChild(row);
        });
    } else {
        reportTableBody.innerHTML = `<tr><td colspan="${headers[type].length}" class="text-center">No data available</td></tr>`;
    }
}

// Format payment method for display
function formatPaymentMethod(method) {
    const methods = {
        'credit_card': 'Credit Card',
        'debit_card': 'Debit Card',
        'cash': 'Cash',
        'bank_transfer': 'Bank Transfer',
        'paypal': 'PayPal',
        'other': 'Other'
    };
    return methods[method] || method;
}

// Get CSS class for payment status
function getPaymentStatusClass(status) {
    const classes = {
        'completed': 'badge-success',
        'pending': 'badge-warning',
        'failed': 'badge-danger',
        'refunded': 'badge-info'
    };
    return classes[status] || 'badge-secondary';
}

// Export report as CSV
function exportReport() {
    try {
        const type = reportType.value;
        const headers = {
            'sales': ['Date', 'Orders', 'Revenue', 'Items Sold', 'Avg. Order Value'],
            'inventory': ['Product', 'Category', 'Stock Level', 'Reorder Point', 'Status'],
            'products': ['Product', 'Category', 'Units Sold', 'Revenue', 'Profit Margin'],
            'customers': ['Customer', 'Orders', 'Total Spent', 'Last Order Date', 'Status'],
            'suppliers': ['Supplier', 'Products', 'Orders', 'On-Time Rate', 'Status'],
            'payments': ['Date', 'Order ID', 'Customer', 'Amount', 'Method', 'Status']
        };

        // Get table data
        const rows = [];
        const tableRows = reportTableBody.querySelectorAll('tr');
        
        // Add header row
        rows.push(headers[type].join(','));
        
        // Add data rows
        tableRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = [];
            
            cells.forEach(cell => {
                // Clean up the cell data (remove $ signs, etc.)
                let cellData = cell.textContent.trim().replace(/\$/g, '');
                
                // If cell contains a badge, get just the status text
                const badge = cell.querySelector('.badge');
                if (badge) {
                    cellData = badge.textContent.trim();
                }
                
                // Escape commas in the data
                if (cellData.includes(',')) {
                    cellData = `"${cellData}"`;
                }
                
                rowData.push(cellData);
            });
            
            rows.push(rowData.join(','));
        });
        
        // Create CSV content
        const csvContent = rows.join('\n');
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${type}_report_${formatDate(new Date())}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
    } catch (error) {
        console.error('Error exporting report:', error);
        alert(`Error: ${error.message}`);
    }
}