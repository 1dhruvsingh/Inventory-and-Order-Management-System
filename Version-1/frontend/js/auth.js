/**
 * Authentication JavaScript for handling user login and session management
 * Simplified for Database Management Course
 * 
 * This version is intentionally simplified for educational purposes.
 * It allows any password for login and focuses on database interactions.
 */

// API URL - Change this to match your backend URL
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');
const loginToggle = document.getElementById('loginToggle');
const registerToggle = document.getElementById('registerToggle');
const dbStatusElement = document.getElementById('dbStatus');
const dbInstructionsElement = document.getElementById('dbInstructions');

// Check if user is already logged in
function checkAuth() {
    const user = localStorage.getItem('user');
    if (user) {
        // Redirect to dashboard if already logged in
        window.location.href = 'dashboard.html';
    }
}

// Toggle between login and register forms
if (loginToggle && registerToggle) {
    loginToggle.addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
    });

    registerToggle.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
    });
}

// Check database connection status
async function checkDatabaseConnection() {
    if (dbStatusElement) {
        try {
            const response = await fetch(`${API_URL}/`);
            if (response.ok) {
                dbStatusElement.textContent = 'Connected';
                dbStatusElement.className = 'db-status connected';
                return true;
            } else {
                dbStatusElement.textContent = 'Disconnected';
                dbStatusElement.className = 'db-status disconnected';
                showDatabaseInstructions();
                return false;
            }
        } catch (error) {
            dbStatusElement.textContent = 'Disconnected';
            dbStatusElement.className = 'db-status disconnected';
            showDatabaseInstructions();
            return false;
        }
    }
    return false;
}

// Show database setup instructions
function showDatabaseInstructions() {
    if (dbInstructionsElement) {
        dbInstructionsElement.style.display = 'block';
        dbInstructionsElement.innerHTML = `
            <h3>Database Connection Instructions</h3>
            <ol>
                <li>Make sure MySQL is running on your MacBook</li>
                <li>Open MySQL Workbench and connect to your local MySQL server</li>
                <li>Run the SQL scripts in the 'database' folder:</li>
                <ul>
                    <li>First run <code>schema.sql</code> to create the database structure</li>
                    <li>Then run <code>seed.sql</code> to populate the database with sample data</li>
                </ul>
                <li>Make sure the backend server is running:</li>
                <ul>
                    <li>Navigate to the backend directory in terminal</li>
                    <li>Run <code>npm install</code> to install dependencies</li>
                    <li>Run <code>npm start</code> to start the server</li>
                </ul>
                <li>Check that the database credentials in <code>backend/.env</code> match your MySQL setup</li>
            </ol>
        `;
    }
}

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous error messages
        loginMessage.textContent = '';
        loginMessage.classList.remove('alert-danger');
        
        // Get form data
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value; // Password is not validated for educational purposes
        
        try {
            // First check database connection
            const isConnected = await checkDatabaseConnection();
            if (!isConnected) {
                throw new Error('Database connection failed. Please check your MySQL setup.');
            }
            
            // Send login request to API
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            // Store user data in localStorage (simplified, no token needed)
            localStorage.setItem('user', JSON.stringify({
                id: data.user_id,
                username: data.username,
                fullName: data.full_name,
                email: data.email,
                role: data.role
            }));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
            
        } catch (error) {
            // Display error message
            loginMessage.textContent = error.message;
            loginMessage.classList.add('alert-danger');
        }
    });
}

// Handle register form submission
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous error messages
        registerMessage.textContent = '';
        registerMessage.classList.remove('alert-danger');
        
        // Get form data
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const fullName = document.getElementById('regFullName').value;
        const password = document.getElementById('regPassword').value;
        
        try {
            // Send register request to API
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username, 
                    password, 
                    email, 
                    full_name: fullName,
                    role: 'staff' // Default role
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }
            
            // Show success message and switch to login form
            registerMessage.textContent = 'Registration successful! Please login.';
            registerMessage.classList.add('alert-success');
            
            // Clear form
            registerForm.reset();
            
            // Switch to login form after 2 seconds
            setTimeout(() => {
                loginToggle.click();
            }, 2000);
            
        } catch (error) {
            // Display error message
            registerMessage.textContent = error.message;
            registerMessage.classList.add('alert-danger');
        }
    });
}

// Logout function
function logout() {
    // Clear localStorage
    localStorage.removeItem('user');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Check authentication status and database connection when page loads
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    checkDatabaseConnection();
});

// Export functions for use in other scripts
window.auth = {
    logout,
    getUser: () => JSON.parse(localStorage.getItem('user')),
    isAdmin: () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user && user.role === 'admin';
    }
};