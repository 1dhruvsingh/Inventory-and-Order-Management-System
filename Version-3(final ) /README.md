# DBMS-3 Project

## Setup Instructions

### 1. MySQL Setup
1. Install MySQL if not already installed
2. Start MySQL server
3. Create a new database:
   ```sql
   CREATE DATABASE dbms3;
   ```

### 2. Import Database Schema
1. Import the schema file:
   ```bash
   mysql -u root -p dbms3 < database_schema.sql
   ```

### 3. Frontend Setup
1. Open the project directory
2. Open `index.html` in your browser

### 4. Using the System
- Access different pages via the navigation menu:
  - Products
  - Orders
  - Customers
  - Suppliers
  - Reports
  - Notifications

### 5. API Endpoints
All API requests are handled through `db_operations.php` which connects to the MySQL database.