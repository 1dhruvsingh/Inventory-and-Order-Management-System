/**
 * Navigation JavaScript for handling sidebar navigation
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get all sidebar menu items
    const sidebarMenuItems = document.querySelectorAll('.sidebar-menu-item');
    
    // Add click event listeners to each menu item
    sidebarMenuItems.forEach(item => {
        // Skip the logout button as it already has its own event listener
        if (item.id !== 'logoutBtn') {
            item.addEventListener('click', (e) => {
                // Get the href attribute
                const href = item.getAttribute('href');
                
                // If href exists and is not '#', navigate to the page
                if (href && href !== '#') {
                    window.location.href = href;
                }
            });
        }
    });
    
    // Add click event listeners to dashboard stat cards
    const productStatCard = document.querySelector('.stat-card .stat-icon.products');
    if (productStatCard) {
        productStatCard.parentElement.addEventListener('click', () => {
            window.location.href = 'products.html';
        });
    }
    
    const orderStatCard = document.querySelector('.stat-card .stat-icon.orders');
    if (orderStatCard) {
        orderStatCard.parentElement.addEventListener('click', () => {
            window.location.href = 'orders.html';
        });
    }
    
    const customerStatCard = document.querySelector('.stat-card .stat-icon.customers');
    if (customerStatCard) {
        customerStatCard.parentElement.addEventListener('click', () => {
            window.location.href = 'customers.html';
        });
    }
    
    const revenueStatCard = document.querySelector('.stat-card .stat-icon.revenue');
    if (revenueStatCard) {
        revenueStatCard.parentElement.addEventListener('click', () => {
            window.location.href = 'reports.html';
        });
    }
    
    // Add click event listeners to "View All" buttons
    const viewAllButtons = document.querySelectorAll('.card-header .btn');
    viewAllButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Get the href attribute
            const href = button.getAttribute('href');
            
            // If href exists, navigate to the page
            if (href) {
                window.location.href = href;
            }
        });
    });
});