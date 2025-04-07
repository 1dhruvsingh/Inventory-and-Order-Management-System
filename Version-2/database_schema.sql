-- Smart Inventory and Order Management System Database Schema

-- Drop database if exists and create a new one
DROP DATABASE IF EXISTS inventory_management;
CREATE DATABASE inventory_management;
USE inventory_management;

-- Users Table: Stores admin and staff details
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,  -- Storing hashed passwords
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Role ENUM('Admin', 'Manager', 'Staff') NOT NULL,
    Phone VARCHAR(20),
    LastLogin DATETIME,
    Status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Suppliers Table: Manages supplier information
CREATE TABLE Suppliers (
    SupplierID INT AUTO_INCREMENT PRIMARY KEY,
    CompanyName VARCHAR(100) NOT NULL,
    ContactName VARCHAR(100),
    Email VARCHAR(100),
    Phone VARCHAR(20) NOT NULL,
    Address VARCHAR(255),
    City VARCHAR(50),
    State VARCHAR(50),
    PostalCode VARCHAR(20),
    Country VARCHAR(50),
    Status ENUM('Active', 'Inactive') DEFAULT 'Active',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers Table: Stores customer details
CREATE TABLE Customers (
    CustomerID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE,
    Phone VARCHAR(20) NOT NULL,
    Address VARCHAR(255),
    City VARCHAR(50),
    State VARCHAR(50),
    PostalCode VARCHAR(20),
    Country VARCHAR(50),
    CustomerType ENUM('Regular', 'VIP', 'Wholesale') DEFAULT 'Regular',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table: Maintains product details and stock levels
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

-- Orders Table: Tracks all orders placed by customers
CREATE TABLE Orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    CustomerID INT,
    UserID INT,  -- Staff who created the order
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    PaymentStatus ENUM('Unpaid', 'Partial', 'Paid') DEFAULT 'Unpaid',
    ShippingAddress VARCHAR(255),
    ShippingCity VARCHAR(50),
    ShippingState VARCHAR(50),
    ShippingPostalCode VARCHAR(20),
    ShippingCountry VARCHAR(50),
    Notes TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID) ON DELETE SET NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- Order Details Table: Handles the relationship between orders and products
CREATE TABLE OrderDetails (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10, 2) NOT NULL,
    Discount DECIMAL(5, 2) DEFAULT 0.00,
    Subtotal DECIMAL(10, 2) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE RESTRICT
);

-- Payments Table: Manages order payments and status
CREATE TABLE Payments (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Amount DECIMAL(10, 2) NOT NULL,
    PaymentMethod ENUM('Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Check', 'Online Payment') NOT NULL,
    TransactionID VARCHAR(100),
    Status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    Notes TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE
);

-- Stock Logs Table: Tracks stock movements additions or removals
CREATE TABLE StockLogs (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    UserID INT,  -- User who made the stock change
    QuantityChanged INT NOT NULL,  -- Positive for additions, negative for removals
    PreviousQuantity INT NOT NULL,
    NewQuantity INT NOT NULL,
    Type ENUM('Purchase', 'Sale', 'Return', 'Adjustment', 'Damaged', 'Expired') NOT NULL,
    Reference VARCHAR(100),  -- Order ID, Supplier Invoice, etc.
    Notes TEXT,
    LogDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- Notifications Table: Stores alerts for users
CREATE TABLE Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,
    Title VARCHAR(100) NOT NULL,
    Message TEXT NOT NULL,
    Type ENUM('Info', 'Warning', 'Alert', 'Success') DEFAULT 'Info',
    RelatedTo VARCHAR(50),  -- e.g., 'Order', 'Product', 'Payment'
    RelatedID INT,  -- ID of the related entity
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Reports Table: Logs system-generated reports for analysis
CREATE TABLE Reports (
    ReportID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT,  -- User who generated the report
    ReportName VARCHAR(100) NOT NULL,
    ReportType ENUM('Sales', 'Inventory', 'Customer', 'Supplier', 'Financial', 'Custom') NOT NULL,
    Parameters TEXT,  -- JSON string of parameters used to generate the report
    FileFormat ENUM('PDF', 'CSV', 'Excel', 'HTML') DEFAULT 'PDF',
    FilePath VARCHAR(255),  -- Path to the generated report file
    GeneratedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);

-- Insert sample data for testing

-- Sample Users
INSERT INTO Users (Username, Password, FullName, Email, Role, Phone) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin@example.com', 'Admin', '555-0100'),
('manager', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Manager User', 'manager@example.com', 'Manager', '555-0101'),
('staff1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Staff One', 'staff1@example.com', 'Staff', '555-0102');

-- Sample Suppliers
INSERT INTO Suppliers (CompanyName, ContactName, Email, Phone, Address, City, State, PostalCode, Country) VALUES
('Tech Supplies Inc.', 'John Smith', 'john@techsupplies.com', '555-1001', '123 Tech St', 'San Francisco', 'CA', '94105', 'USA'),
('Office Solutions', 'Mary Johnson', 'mary@officesolutions.com', '555-1002', '456 Office Blvd', 'New York', 'NY', '10001', 'USA'),
('Global Electronics', 'Robert Lee', 'robert@globalelectronics.com', '555-1003', '789 Electronic Ave', 'Chicago', 'IL', '60007', 'USA');

-- Sample Customers
INSERT INTO Customers (FirstName, LastName, Email, Phone, Address, City, State, PostalCode, Country, CustomerType) VALUES
('Alice', 'Brown', 'alice@example.com', '555-2001', '101 Customer Lane', 'Los Angeles', 'CA', '90001', 'USA', 'Regular'),
('Bob', 'Williams', 'bob@example.com', '555-2002', '202 Buyer Street', 'Miami', 'FL', '33101', 'USA', 'VIP'),
('Charlie', 'Davis', 'charlie@example.com', '555-2003', '303 Client Road', 'Seattle', 'WA', '98101', 'USA', 'Wholesale');

-- Sample Products
INSERT INTO Products (ProductName, Description, SKU, Category, SupplierID, CostPrice, SellingPrice, StockQuantity, ReorderLevel) VALUES
('Laptop Pro X', '15-inch professional laptop with 16GB RAM', 'LP-001', 'Electronics', 1, 800.00, 1200.00, 25, 5),
('Office Desk', 'Adjustable height office desk', 'OD-002', 'Furniture', 2, 150.00, 299.99, 10, 3),
('Wireless Mouse', 'Ergonomic wireless mouse', 'WM-003', 'Accessories', 3, 15.00, 29.99, 50, 10),
('Desk Chair', 'Comfortable office chair with lumbar support', 'DC-004', 'Furniture', 2, 100.00, 199.99, 15, 5),
('USB-C Cable', 'High-speed USB-C charging cable', 'UC-005', 'Accessories', 3, 5.00, 12.99, 100, 20);

-- Sample Orders
INSERT INTO Orders (CustomerID, UserID, TotalAmount, Status, PaymentStatus, ShippingAddress, ShippingCity, ShippingState, ShippingPostalCode, ShippingCountry) VALUES
(1, 3, 1229.99, 'Delivered', 'Paid', '101 Customer Lane', 'Los Angeles', 'CA', '90001', 'USA'),
(2, 2, 499.98, 'Processing', 'Partial', '202 Buyer Street', 'Miami', 'FL', '33101', 'USA'),
(3, 3, 3000.00, 'Pending', 'Unpaid', '303 Client Road', 'Seattle', 'WA', '98101', 'USA');

-- Sample Order Details
INSERT INTO OrderDetails (OrderID, ProductID, Quantity, UnitPrice, Discount, Subtotal) VALUES
(1, 1, 1, 1200.00, 0.00, 1200.00),
(1, 3, 1, 29.99, 0.00, 29.99),
(2, 4, 2, 199.99, 0.00, 399.98),
(2, 5, 5, 12.99, 0.00, 64.95),
(3, 1, 2, 1200.00, 0.00, 2400.00),
(3, 2, 2, 299.99, 0.00, 599.98);

-- Sample Payments
INSERT INTO Payments (OrderID, Amount, PaymentMethod, TransactionID, Status) VALUES
(1, 1229.99, 'Credit Card', 'TXN-001-CC', 'Completed'),
(2, 200.00, 'Cash', 'TXN-002-CASH', 'Completed'),
(2, 100.00, 'Bank Transfer', 'TXN-002-BT', 'Pending');

-- Sample Stock Logs
INSERT INTO StockLogs (ProductID, UserID, QuantityChanged, PreviousQuantity, NewQuantity, Type, Reference, Notes) VALUES
(1, 1, 30, 0, 30, 'Purchase', 'PO-001', 'Initial stock purchase'),
(1, 3, -5, 30, 25, 'Sale', 'Order-001', 'Regular sale'),
(2, 1, 15, 0, 15, 'Purchase', 'PO-002', 'Initial stock purchase'),
(2, 3, -5, 15, 10, 'Sale', 'Order-002', 'Regular sale'),
(3, 1, 60, 0, 60, 'Purchase', 'PO-003', 'Initial stock purchase'),
(3, 3, -10, 60, 50, 'Sale', 'Order-003', 'Regular sale');

-- Sample Notifications
INSERT INTO Notifications (UserID, Title, Message, Type, RelatedTo, RelatedID) VALUES
(1, 'Low Stock Alert', 'Product "Office Desk" is below reorder level', 'Warning', 'Product', 2),
(2, 'New Order', 'New order #3 has been placed', 'Info', 'Order', 3),
(3, 'Payment Received', 'Payment for order #1 has been completed', 'Success', 'Payment', 1);

-- Sample Reports
INSERT INTO Reports (UserID, ReportName, ReportType, Parameters, FileFormat, FilePath) VALUES
(1, 'Monthly Sales Report - Jan 2023', 'Sales', '{"month":1,"year":2023}', 'PDF', '/reports/sales_2023_01.pdf'),
(1, 'Inventory Status Report', 'Inventory', '{"date":"2023-01-31"}', 'Excel', '/reports/inventory_2023_01_31.xlsx'),
(2, 'Customer Purchase History - Q1 2023', 'Customer', '{"quarter":1,"year":2023}', 'PDF', '/reports/customer_purchases_2023_q1.pdf');