-- Smart Inventory and Order Management System Sample Data

USE inventory_management;

-- Insert sample Users
INSERT INTO Users (username, password, email, full_name, role, phone) VALUES
('admin', '$2a$10$NlBIJQXYtF8BLOhQhHgp8eWRLKrXlYx64kWNukn7MX4d.xzIq5Ufi', 'admin@example.com', 'Admin User', 'admin', '555-123-4567'),
('staff1', '$2a$10$8KzA.F5CbrLUqJ5o9CVyh.ZJlPFcD.LPjmLN0DVkKFi1QQRqL.JXi', 'staff@example.com', 'Staff User', 'staff', '555-987-6543'),
('manager1', '$2a$10$8KzA.F5CbrLUqJ5o9CVyh.ZJlPFcD.LPjmLN0DVkKFi1QQRqL.JXi', 'manager@example.com', 'Manager User', 'admin', '555-456-7890');
-- Note: Passwords are hashed, but for demo purposes they are 'admin123', 'staff123', and 'manager123'

-- Insert sample Suppliers
INSERT INTO Suppliers (supplier_name, contact_person, email, phone, address, city, state, postal_code, country) VALUES
('Tech Supplies Inc.', 'John Smith', 'john@techsupplies.com', '555-111-2222', '123 Tech St', 'San Francisco', 'CA', '94105', 'USA'),
('Office Solutions', 'Jane Doe', 'jane@officesolutions.com', '555-333-4444', '456 Office Ave', 'New York', 'NY', '10001', 'USA'),
('Global Electronics', 'Mike Johnson', 'mike@globalelectronics.com', '555-555-6666', '789 Electronic Blvd', 'Chicago', 'IL', '60601', 'USA'),
('Furniture Depot', 'Sarah Williams', 'sarah@furnituredepot.com', '555-777-8888', '321 Furniture Ln', 'Los Angeles', 'CA', '90001', 'USA');

-- Insert sample Products
INSERT INTO Products (product_name, description, category, unit_price, stock_quantity, reorder_level, supplier_id, sku, image_url) VALUES
('Laptop Pro X', '15-inch professional laptop with 16GB RAM and 512GB SSD', 'Electronics', 1299.99, 25, 5, 3, 'LP-001', '/assets/images/laptop-pro-x.jpg'),
('Office Desk Standard', 'Standard office desk with 3 drawers', 'Furniture', 249.99, 15, 3, 4, 'OD-001', '/assets/images/office-desk.jpg'),
('Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 'Electronics', 29.99, 50, 10, 3, 'WM-001', '/assets/images/wireless-mouse.jpg'),
('Premium Paper Ream', 'Premium quality A4 paper, 500 sheets', 'Office Supplies', 9.99, 100, 20, 2, 'PP-001', '/assets/images/paper-ream.jpg'),
('Ergonomic Chair', 'Adjustable ergonomic office chair', 'Furniture', 199.99, 10, 2, 4, 'EC-001', '/assets/images/ergonomic-chair.jpg'),
('USB-C Hub', '7-port USB-C hub with HDMI and ethernet', 'Electronics', 49.99, 30, 5, 3, 'UC-001', '/assets/images/usb-hub.jpg'),
('Whiteboard', '48x36 inch magnetic whiteboard', 'Office Supplies', 79.99, 12, 3, 2, 'WB-001', '/assets/images/whiteboard.jpg'),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 'Furniture', 39.99, 20, 5, 4, 'DL-001', '/assets/images/desk-lamp.jpg'),
('Notebook Set', 'Set of 3 premium notebooks', 'Office Supplies', 14.99, 40, 8, 2, 'NS-001', '/assets/images/notebook-set.jpg'),
('Wireless Keyboard', 'Slim wireless keyboard with numeric keypad', 'Electronics', 59.99, 25, 5, 3, 'WK-001', '/assets/images/wireless-keyboard.jpg');

-- Insert sample Customers
INSERT INTO Customers (customer_name, email, phone, address, city, state, postal_code, country) VALUES
('Acme Corporation', 'contact@acme.com', '555-123-0001', '100 Acme Blvd', 'Boston', 'MA', '02108', 'USA'),
('Globex Industries', 'info@globex.com', '555-123-0002', '200 Globex Ave', 'Seattle', 'WA', '98101', 'USA'),
('Stark Enterprises', 'orders@stark.com', '555-123-0003', '300 Stark Tower', 'New York', 'NY', '10007', 'USA'),
('Wayne Enterprises', 'procurement@wayne.com', '555-123-0004', '400 Wayne Manor', 'Gotham', 'NJ', '07101', 'USA'),
('Umbrella Corporation', 'supply@umbrella.com', '555-123-0005', '500 Umbrella St', 'Raccoon City', 'MI', '48226', 'USA');

-- Insert sample Orders
INSERT INTO Orders (customer_id, user_id, order_date, total_amount, status, shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country) VALUES
(1, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), 1579.97, 'delivered', '100 Acme Blvd', 'Boston', 'MA', '02108', 'USA'),
(2, 2, DATE_SUB(NOW(), INTERVAL 15 DAY), 349.97, 'shipped', '200 Globex Ave', 'Seattle', 'WA', '98101', 'USA'),
(3, 1, DATE_SUB(NOW(), INTERVAL 7 DAY), 2599.98, 'processing', '300 Stark Tower', 'New York', 'NY', '10007', 'USA'),
(4, 2, DATE_SUB(NOW(), INTERVAL 3 DAY), 129.98, 'pending', '400 Wayne Manor', 'Gotham', 'NJ', '07101', 'USA'),
(5, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), 449.95, 'pending', '500 Umbrella St', 'Raccoon City', 'MI', '48226', 'USA');

-- Insert sample OrderDetails
INSERT INTO OrderDetails (order_id, product_id, quantity, unit_price, subtotal, discount) VALUES
(1, 1, 1, 1299.99, 1299.99, 0.00),
(1, 3, 1, 29.99, 29.99, 0.00),
(1, 6, 5, 49.99, 249.99, 0.00),
(2, 4, 5, 9.99, 49.95, 0.00),
(2, 5, 1, 199.99, 199.99, 0.00),
(2, 9, 2, 14.99, 29.98, 0.00),
(2, 8, 1, 39.99, 39.99, 0.00),
(2, 3, 1, 29.99, 29.99, 0.00),
(3, 1, 2, 1299.99, 2599.98, 0.00),
(4, 9, 3, 14.99, 44.97, 0.00),
(4, 4, 5, 9.99, 49.95, 0.00),
(4, 3, 1, 29.99, 29.99, 0.00),
(4, 6, 1, 49.99, 49.99, 0.00),
(5, 5, 2, 199.99, 399.98, 0.00),
(5, 8, 1, 39.99, 39.99, 0.00),
(5, 9, 1, 14.99, 14.99, 0.00);

-- Insert sample Payments
INSERT INTO Payments (order_id, payment_date, amount, payment_method, transaction_id, status) VALUES
(1, DATE_SUB(NOW(), INTERVAL 29 DAY), 1579.97, 'credit_card', 'TXN123456789', 'completed'),
(2, DATE_SUB(NOW(), INTERVAL 14 DAY), 349.97, 'paypal', 'PP987654321', 'completed'),
(3, DATE_SUB(NOW(), INTERVAL 6 DAY), 2599.98, 'bank_transfer', 'BT543216789', 'pending'),
(4, DATE_SUB(NOW(), INTERVAL 3 DAY), 129.98, 'credit_card', 'TXN567891234', 'pending'),
(5, DATE_SUB(NOW(), INTERVAL 1 DAY), 449.95, 'debit_card', 'TXN678912345', 'pending');

-- Insert sample StockLogs
INSERT INTO StockLogs (product_id, user_id, change_quantity, previous_quantity, new_quantity, change_type, reference_id, notes) VALUES
(1, 1, -1, 26, 25, 'sale', 1, 'Order #1'),
(3, 1, -1, 51, 50, 'sale', 1, 'Order #1'),
(6, 1, -5, 35, 30, 'sale', 1, 'Order #1'),
(4, 2, -5, 105, 100, 'sale', 2, 'Order #2'),
(5, 2, -1, 11, 10, 'sale', 2, 'Order #2'),
(9, 2, -2, 42, 40, 'sale', 2, 'Order #2'),
(8, 2, -1, 21, 20, 'sale', 2, 'Order #2'),
(3, 2, -1, 50, 49, 'sale', 2, 'Order #2'),
(1, 1, 10, 25, 35, 'purchase', NULL, 'Restocking'),
(5, 1, 5, 10, 15, 'purchase', NULL, 'Restocking');

-- Insert sample Notifications
INSERT INTO Notifications (user_id, title, message, type, reference_id, is_read) VALUES
(1, 'Low Stock Alert', 'Ergonomic Chair (EC-001) is below reorder level', 'low_stock', 5, FALSE),
(2, 'Order Status Update', 'Order #2 has been shipped', 'order_status', 2, TRUE),
(NULL, 'System Maintenance', 'System will be down for maintenance on Sunday at 2 AM', 'system', NULL, FALSE),
(1, 'Payment Received', 'Payment for Order #1 has been completed', 'payment', 1, TRUE),
(2, 'New Order', 'New order #5 has been placed and needs processing', 'order_status', 5, FALSE);

-- Insert sample Reports
INSERT INTO Reports (user_id, report_name, report_type, parameters, result_data, created_at) VALUES
(1, 'Monthly Sales Report - Jan 2023', 'sales', '{"start_date": "2023-01-01", "end_date": "2023-01-31"}', '{"total_sales": 15750.25, "total_orders": 25, "top_products": [{"product_id": 1, "product_name": "Laptop Pro X", "quantity": 10, "revenue": 12999.90}]}', '2023-02-01 09:00:00'),
(1, 'Inventory Status Report', 'inventory', '{"category": "all", "low_stock_only": true}', '{"total_products": 10, "low_stock_products": 2, "total_value": 35250.75}', '2023-02-15 10:30:00'),
(1, 'Customer Purchase History - Acme Corp', 'customer', '{"customer_id": 1, "start_date": "2022-01-01", "end_date": "2023-01-31"}', '{"customer_name": "Acme Corporation", "total_orders": 12, "total_spent": 25890.50}', '2023-02-20 14:15:00');