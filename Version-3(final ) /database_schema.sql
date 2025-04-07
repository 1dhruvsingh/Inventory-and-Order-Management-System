-- Smart Inventory and Order Management System Database Schema

-- Drop database if exists to start fresh
DROP DATABASE IF EXISTS inventory_management;

-- Create database
CREATE DATABASE inventory_management;

-- Use the database
USE inventory_management;

-- Users Table - Stores admin and staff details
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,  -- Storing hashed passwords
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Role ENUM('Admin', 'Manager', 'Staff') NOT NULL,
    Phone VARCHAR(20),
    LastLogin DATETIME,
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers Table - Manages supplier information
CREATE TABLE Suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(100) NOT NULL,
    ContactName VARCHAR(100),
    ContactEmail VARCHAR(100),
    ContactPhone VARCHAR(20),
    Address VARCHAR(255),
    City VARCHAR(50),
    State VARCHAR(50),
    PostalCode VARCHAR(20),
    Country VARCHAR(50),
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table - Maintains product details and stock levels
CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(100) NOT NULL,
    Description TEXT,
    SKU VARCHAR(50) UNIQUE,
    Category VARCHAR(50),
    SupplierID INT,
    CostPrice DECIMAL(10, 2) NOT NULL,
    SellingPrice DECIMAL(10, 2) NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    ReorderLevel INT DEFAULT 10,
    Status ENUM('Available', 'Low Stock', 'Out of Stock', 'Discontinued') DEFAULT 'Available',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID) ON DELETE SET NULL
);

-- Customers Table - Stores customer details
CREATE TABLE Customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Phone VARCHAR(20),
    Address VARCHAR(255),
    City VARCHAR(50),
    State VARCHAR(50),
    PostalCode VARCHAR(20),
    Country VARCHAR(50),
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders Table - Tracks all orders placed by customers
CREATE TABLE Orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT NOT NULL,
    UserID INT,  -- Staff who processed the order
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    RequiredDate DATETIME,
    ShippedDate DATETIME,
    Status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    ShippingAddress VARCHAR(255),
    ShippingCity VARCHAR(50),
    ShippingState VARCHAR(50),
    ShippingPostalCode VARCHAR(20),
    ShippingCountry VARCHAR(50),
    TotalAmount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    Notes TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- Order Details Table - Handles the relationship between orders and products
CREATE TABLE OrderDetails (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10, 2) NOT NULL,  -- Price at time of order
    Discount DECIMAL(5, 2) DEFAULT 0.00,
    SubTotal DECIMAL(10, 2) GENERATED ALWAYS AS (Quantity * UnitPrice * (1 - Discount)) STORED,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE RESTRICT
);

-- Payments Table - Manages order payments and status
CREATE TABLE Payments (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Amount DECIMAL(10, 2) NOT NULL,
    PaymentMethod ENUM('Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'PayPal', 'Other') NOT NULL,
    TransactionID VARCHAR(100),
    Status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    Notes TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE
);

-- Stock Logs Table - Tracks stock movements additions or removals
CREATE TABLE StockLogs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    UserID INT,  -- User who made the change
    ChangeType ENUM('Addition', 'Removal', 'Adjustment', 'Damaged', 'Returned') NOT NULL,
    Quantity INT NOT NULL,  -- Positive for additions, negative for removals
    PreviousQuantity INT NOT NULL,
    NewQuantity INT NOT NULL,
    Reason TEXT,
    ReferenceID INT,  -- Could be OrderID or other reference
    ReferenceType VARCHAR(50),  -- 'Order', 'Manual Adjustment', etc.
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- Notifications Table - Stores alerts for users
CREATE TABLE Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Message TEXT NOT NULL,
    Type ENUM('Info', 'Warning', 'Alert', 'Success') DEFAULT 'Info',
    RelatedTo VARCHAR(50),  -- 'Order', 'Product', 'Payment', etc.
    RelatedID INT,  -- ID of the related entity
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Reports Table - Logs system-generated reports for analysis
CREATE TABLE Reports (
    ReportID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,  -- User who generated the report
    ReportName VARCHAR(100) NOT NULL,
    ReportType ENUM('Sales', 'Inventory', 'Customer', 'Supplier', 'Financial', 'Custom') NOT NULL,
    Parameters TEXT,  -- JSON string of parameters used
    FileFormat ENUM('PDF', 'CSV', 'Excel', 'HTML') NOT NULL,
    FilePath VARCHAR(255),  -- Path to the generated report file
    GeneratedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('Pending', 'Completed', 'Failed') DEFAULT 'Pending',
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- Add some sample data for testing

-- Insert sample users
INSERT INTO Users (Username, Password, FullName, Email, Role, Phone) VALUES
('admin', '$2y$10$HfzIhGCCaxqyaIdGgjARSuOKAcm1Uy82YfLuNaajn6JrjLWy9Sj/W', 'Admin User', 'admin@example.com', 'Admin', '555-123-4567'),
('manager', '$2y$10$HfzIhGCCaxqyaIdGgjARSuOKAcm1Uy82YfLuNaajn6JrjLWy9Sj/W', 'Manager User', 'manager@example.com', 'Manager', '555-234-5678'),
('staff', '$2y$10$HfzIhGCCaxqyaIdGgjARSuOKAcm1Uy82YfLuNaajn6JrjLWy9Sj/W', 'Staff User', 'staff@example.com', 'Staff', '555-345-6789');

-- Insert sample suppliers
INSERT INTO Suppliers (CompanyName, ContactName, ContactEmail, ContactPhone, Address, City, State, PostalCode, Country) VALUES
('Tech Supplies Inc.', 'John Smith', 'john@techsupplies.com', '555-111-2222', '123 Tech St', 'San Francisco', 'CA', '94107', 'USA'),
('Office Solutions', 'Jane Doe', 'jane@officesolutions.com', '555-222-3333', '456 Office Ave', 'New York', 'NY', '10001', 'USA'),
('Global Electronics', 'Mike Johnson', 'mike@globalelectronics.com', '555-333-4444', '789 Electronic Blvd', 'Chicago', 'IL', '60601', 'USA');

-- Insert sample products
INSERT INTO Products (ProductName, Description, SKU, Category, SupplierID, CostPrice, SellingPrice, StockQuantity, ReorderLevel) VALUES
('Laptop Pro', '15-inch professional laptop with 16GB RAM', 'LP-001', 'Electronics', 1, 800.00, 1200.00, 25, 5),
('Office Desk', 'Adjustable height office desk', 'OD-001', 'Furniture', 2, 150.00, 300.00, 10, 3),
('Wireless Mouse', 'Ergonomic wireless mouse', 'WM-001', 'Accessories', 3, 15.00, 30.00, 50, 10),
('Monitor 24"', '24-inch HD monitor', 'MON-001', 'Electronics', 1, 120.00, 200.00, 15, 5),
('Keyboard', 'Mechanical keyboard with RGB lighting', 'KB-001', 'Accessories', 3, 40.00, 80.00, 30, 8);

-- Insert sample customers
INSERT INTO Customers (FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country) VALUES
('Alice', 'Johnson', 'alice@example.com', '555-987-6543', '101 Customer St', 'Los Angeles', 'CA', '90001', 'USA'),
('Bob', 'Williams', 'bob@example.com', '555-876-5432', '202 Client Ave', 'Seattle', 'WA', '98101', 'USA'),
('Carol', 'Davis', 'carol@example.com', '555-765-4321', '303 Buyer Rd', 'Boston', 'MA', '02108', 'USA');

-- Insert sample orders
INSERT INTO Orders (CustomerID, UserID, OrderDate, RequiredDate, Status, ShippingAddress, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry, TotalAmount) VALUES
(1, 2, NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY), 'Processing', '101 Customer St', 'Los Angeles', 'CA', '90001', 'USA', 1230.00),
(2, 3, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 'Shipped', '202 Client Ave', 'Seattle', 'WA', '98101', 'USA', 300.00),
(3, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), 'Delivered', '303 Buyer Rd', 'Boston', 'MA', '02108', 'USA', 110.00);

-- Insert sample order details
INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice, Discount) VALUES
(1, 1, 1, 1200.00, 0.00),  -- Laptop Pro
(1, 3, 1, 30.00, 0.00),    -- Wireless Mouse
(2, 2, 1, 300.00, 0.00),   -- Office Desk
(3, 3, 2, 30.00, 0.00),    -- 2 Wireless Mice
(3, 5, 1, 80.00, 0.25);    -- Keyboard with 25% discount

-- Insert sample payments
INSERT INTO Payments (OrderID, PaymentDate, Amount, PaymentMethod, TransactionID, Status) VALUES
(1, NOW(), 1230.00, 'Credit Card', 'TXN-12345', 'Completed'),
(2, DATE_SUB(NOW(), INTERVAL 2 DAY), 300.00, 'PayPal', 'PP-67890', 'Completed'),
(3, DATE_SUB(NOW(), INTERVAL 5 DAY), 110.00, 'Debit Card', 'TXN-54321', 'Completed');

-- Insert sample stock logs
INSERT INTO StockLogs (ProductID, UserID, ChangeType, Quantity, PreviousQuantity, NewQuantity, Reason, ReferenceType) VALUES
(1, 1, 'Addition', 30, 0, 30, 'Initial stock', 'Manual Adjustment'),
(1, 2, 'Removal', -1, 30, 29, 'Order fulfillment', 'Order'),
(1, 1, 'Removal', -4, 29, 25, 'Inventory adjustment', 'Manual Adjustment'),
(2, 1, 'Addition', 15, 0, 15, 'Initial stock', 'Manual Adjustment'),
(2, 2, 'Removal', -1, 15, 14, 'Order fulfillment', 'Order'),
(2, 1, 'Removal', -4, 14, 10, 'Inventory adjustment', 'Manual Adjustment');

-- Insert sample notifications
INSERT INTO Notifications (UserID, Title, Message, Type, RelatedTo, RelatedID) VALUES
(1, 'Low Stock Alert', 'Office Desk is running low on stock', 'Warning', 'Product', 2),
(2, 'New Order', 'New order #1 has been placed', 'Info', 'Order', 1),
(3, 'Payment Received', 'Payment for order #3 has been received', 'Success', 'Payment', 3);

-- Insert sample reports
INSERT INTO Reports (UserID, ReportName, ReportType, Parameters, FileFormat, FilePath, Status) VALUES
(1, 'Monthly Sales Report - August 2023', 'Sales', '{"month":8,"year":2023}', 'PDF', '/reports/sales_202308.pdf', 'Completed'),
(1, 'Inventory Status Report', 'Inventory', '{"below_threshold":true}', 'Excel', '/reports/inventory_status.xlsx', 'Completed'),
(2, 'Customer Purchase History', 'Customer', '{"customer_id":1}', 'PDF', '/reports/customer_1_history.pdf', 'Completed');