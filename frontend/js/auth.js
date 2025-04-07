/**
 * Authentication JavaScript for handling user login and session management
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

// Handle login form submission
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Clear previous error messages
        loginMessage.textContent = '';
        loginMessage.classList.remove('alert-danger');
        
        // Get form data
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
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

// Check authentication status when page loads
document.addEventListener('DOMContentLoaded', checkAuth);

// Export functions for use in other scripts
window.auth = {
    logout,
    getUser: () => JSON.parse(localStorage.getItem('user')),
    isAdmin: () => {
        const user = JSON.parse(localStorage.getItem('user'));
        return user && user.role === 'admin';
    }
};