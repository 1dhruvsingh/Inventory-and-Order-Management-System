# Smart Inventory and Order Management System

A full-stack web-based system that allows businesses to manage inventory, customers, suppliers, orders, and payments with real-time updates and reporting capabilities.

## Project Overview

This system is designed to help businesses efficiently manage their inventory and order processes through a user-friendly web interface. It provides a comprehensive solution for tracking products, managing customer and supplier data, processing orders, tracking payments, and generating insightful business reports.

The Smart Inventory and Order Management System addresses common challenges faced by businesses:
- Inventory tracking and stock level management
- Order processing and fulfillment
- Customer relationship management
- Supplier coordination
- Payment tracking and reconciliation
- Business performance analysis

## Key Features

### User Management
- **Role-based Authentication**: Secure login with different permission levels for admins and staff
- **User Profiles**: Manage user information and access privileges
- **Activity Logging**: Track user actions for accountability

### Dashboard
- **Real-time Overview**: Summary of key business metrics
- **Stock Alerts**: Visual indicators for low stock items
- **Recent Activity**: Latest orders, payments, and system notifications
- **Performance Metrics**: Sales trends, top products, and revenue statistics

### Product Management
- **Comprehensive Inventory**: Complete CRUD operations for product catalog
- **Stock Tracking**: Real-time monitoring of inventory levels
- **Categorization**: Organize products by category for easy management
- **Supplier Association**: Link products to specific suppliers
- **Reorder Alerts**: Automatic notifications when stock falls below threshold

### Order Management
- **Order Creation**: Intuitive interface for creating new orders
- **Order Processing**: Track orders through various fulfillment stages
- **Invoice Generation**: Automatic creation of professional invoices
- **Order History**: Complete record of all customer orders

### Customer Management
- **Customer Database**: Store and manage customer information
- **Purchase History**: View complete customer order history
- **Contact Management**: Easily access customer contact details

### Supplier Management
- **Supplier Directory**: Maintain detailed supplier information
- **Product Sourcing**: Track which suppliers provide which products
- **Contact Management**: Quick access to supplier contact details

### Payment Tracking
- **Payment Recording**: Log all payment transactions
- **Multiple Payment Methods**: Support for various payment types
- **Payment Status**: Track pending and completed payments
- **Payment History**: Complete record of all financial transactions

### Reporting
- **Sales Reports**: Analyze sales performance over time
- **Inventory Reports**: Track stock levels and product movement
- **Customer Reports**: Understand customer purchasing patterns
- **Financial Reports**: Monitor revenue, costs, and profitability
- **Custom Reports**: Generate reports based on specific parameters

### Notifications
- **Low Stock Alerts**: Automatic notifications when products need reordering
- **Order Status Updates**: Real-time notifications on order progress
- **Payment Confirmations**: Alerts for payment receipts and issues
- **System Notifications**: Important system-wide announcements

## System Architecture

The Smart Inventory and Order Management System follows a traditional three-tier architecture:

### Frontend (Presentation Layer)
- **Technologies**: HTML5, CSS3, JavaScript
- **Functionality**: Provides the user interface for interacting with the system
- **Features**: Responsive design, intuitive navigation, form validation

### Backend (Application Layer)
- **Technologies**: Node.js, Express.js
- **Functionality**: Handles business logic, data processing, and API endpoints
- **Features**: RESTful API design, middleware for authentication, error handling

### Database (Data Layer)
- **Technology**: MySQL
- **Functionality**: Stores all system data in a relational structure
- **Features**: Optimized schema design, indexed queries for performance

## Database Design

The system uses a relational database with the following tables and relationships:

### Core Tables

1. **Users**
   - Stores admin and staff member information
   - Fields: user_id, username, password (hashed), email, full_name, role, phone, created_at, last_login, status

2. **Products**
   - Contains product information and current stock levels
   - Fields: product_id, product_name, description, category, unit_price, stock_quantity, reorder_level, supplier_id, sku, image_url, created_at, updated_at, status

3. **Suppliers**
   - Maintains supplier details and products supplied
   - Fields: supplier_id, supplier_name, contact_person, email, phone, address, city, state, postal_code, country, created_at, updated_at, status

4. **Customers**
   - Stores customer information for order processing
   - Fields: customer_id, customer_name, email, phone, address, city, state, postal_code, country, created_at, updated_at, status

5. **Orders**
   - Contains order metadata and status information
   - Fields: order_id, customer_id, user_id, order_date, total_amount, status, shipping_address, shipping_city, shipping_state, shipping_postal_code, shipping_country, notes

6. **OrderDetails**
   - Stores line items for each order
   - Fields: order_detail_id, order_id, product_id, quantity, unit_price, subtotal, discount

7. **Payments**
   - Tracks payment information for orders
   - Fields: payment_id, order_id, payment_date, amount, payment_method, transaction_id, status, notes

8. **StockLogs**
   - Records all changes to product stock levels
   - Fields: log_id, product_id, user_id, change_quantity, previous_quantity, new_quantity, change_type, reference_id, log_date, notes

9. **Notifications**
   - Stores system alerts and user notifications
   - Fields: notification_id, user_id, title, message, type, reference_id, is_read, created_at

10. **Reports**
    - Contains generated business reports
    - Fields: report_id, user_id, report_name, report_type, parameters, result_data, created_at

### Key Relationships

- Products ↔ Suppliers: Many products can be supplied by one supplier
- Orders ↔ Customers: One customer can place many orders
- Orders ↔ OrderDetails: One order can have many order details
- OrderDetails ↔ Products: Each order detail references one product
- Orders ↔ Payments: One order can have multiple payments
- Products ↔ StockLogs: Each stock change is associated with one product
- Users ↔ Orders/Reports/StockLogs: Users create orders, reports, and stock logs

## API Structure

The system provides a RESTful API with the following endpoints:

### Authentication Endpoints
- `POST /api/users/login` - User login
- `POST /api/users/register` - Register new user (admin only)
- `GET /api/users/profile` - Get current user profile

### Product Endpoints
- `GET /api/products` - Get all products (with optional filters)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Supplier Endpoints
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create new supplier
- `PUT /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier

### Customer Endpoints
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Order Endpoints
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Payment Endpoints
- `GET /api/payments` - Get all payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments` - Record new payment
- `PUT /api/payments/:id` - Update payment status

### Report Endpoints
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Generate new report

### Notification Endpoints
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification

## Tech Stack

### Frontend
- **HTML5**: Structure and content
- **CSS3**: Styling and responsive design
- **JavaScript**: Client-side functionality and DOM manipulation
- **Font Awesome**: Icon library for UI elements

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **dotenv**: Environment variable management
- **cors**: Cross-origin resource sharing

### Database
- **MySQL**: Relational database management system
- **mysql2**: MySQL client for Node.js

### Development Tools
- **nodemon**: Automatic server restart during development

## Project Structure

```
├── backend/                 # Backend code
│   ├── config/              # Configuration files
│   │   └── db.js            # Database connection setup
│   ├── controllers/         # Request handlers
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── supplierController.js
│   │   ├── customerController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── stockLogController.js
│   │   ├── notificationController.js
│   │   └── reportController.js
│   ├── middleware/          # Middleware functions
│   │   └── authMiddleware.js # Authentication middleware
│   ├── models/              # Database models
│   │   ├── userModel.js
│   │   ├── productModel.js
│   │   ├── supplierModel.js
│   │   ├── customerModel.js
│   │   ├── orderModel.js
│   │   ├── paymentModel.js
│   │   ├── stockLogModel.js
│   │   ├── notificationModel.js
│   │   └── reportModel.js
│   ├── routes/              # API routes
│   │   ├── userRoutes.js
│   │   ├── productRoutes.js
│   │   ├── supplierRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── stockLogRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── reportRoutes.js
│   ├── utils/               # Utility functions
│   │   └── authUtils.js     # Authentication utilities
│   ├── .env                 # Environment variables (not in repo)
│   ├── package.json         # Project dependencies
│   └── server.js            # Entry point
├── database/                # Database scripts and diagrams
│   ├── er_diagram.md        # ER diagram documentation
│   ├── er_diagram.svg       # ER diagram visualization
│   ├── schema.sql           # SQL script for creating tables
│   └── seed.sql             # SQL script for sample data
├── frontend/                # Frontend code
│   ├── css/                 # Stylesheets
│   │   └── styles.css       # Main stylesheet
│   ├── js/                  # JavaScript files
│   │   ├── auth.js          # Authentication functions
│   │   ├── dashboard.js     # Dashboard functionality
│   │   ├── products.js      # Product management
│   │   ├── suppliers.js     # Supplier management
│   │   ├── customers.js     # Customer management
│   │   ├── orders.js        # Order management
│   │   ├── payments.js      # Payment tracking
│   │   └── reports.js       # Reporting functionality
│   ├── dashboard.html       # Dashboard page
│   ├── products.html        # Products management page
│   ├── suppliers.html       # Suppliers management page
│   ├── customers.html       # Customers management page
│   ├── orders.html          # Orders management page
│   ├── payments.html        # Payments tracking page
│   ├── reports.html         # Reports generation page
│   └── login.html           # Login page
└── README.md                # Project documentation
```

## Setup Instructions

### Prerequisites

- **Node.js** (v14 or higher)
- **MySQL** (v5.7 or higher)
- **Git** (for cloning the repository)

### Installation Steps

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

#### 2. Set Up the Database

1. Log in to MySQL:
   ```bash
   mysql -u username -p
   ```

2. Create and populate the database:
   ```bash
   mysql -u username -p < database/schema.sql
   mysql -u username -p < database/seed.sql
   ```

#### 3. Configure the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following content:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=inventory_management
   PORT=3000
   JWT_SECRET=your_jwt_secret_key
   ```

#### 4. Start the Backend Server

1. For development (with auto-restart):
   ```bash
   npm run dev
   ```

2. For production:
   ```bash
   npm start
   ```

3. The server should start on port 3000 (or the port specified in your .env file)

#### 5. Access the Frontend

1. Open any of the HTML files in the `frontend` directory with a web browser:
   ```bash
   cd ../frontend
   open login.html  # On macOS
   # OR
   start login.html  # On Windows
   ```

2. For a better development experience, you can use a simple HTTP server:
   ```bash
   # Install a simple HTTP server if you don't have one
   npm install -g http-server
   
   # Start the server in the frontend directory
   cd frontend
   http-server
   ```

3. Then access the application at `http://localhost:8080`

### Login Credentials

Use these credentials to log in to the system:

- **Admin User**:
  - Email: admin@example.com
  - Password: admin123

- **Staff User**:
  - Email: staff@example.com
  - Password: staff123

## Development Guidelines

### Backend Development

1. **Adding New Features**:
   - Create appropriate model functions in the relevant model file
   - Implement controller functions in the corresponding controller file
   - Define routes in the respective route file
   - Update server.js if adding entirely new resource types

2. **Database Changes**:
   - Update the schema.sql file with new tables or columns
   - Add appropriate indexes for performance optimization
   - Update the ER diagram documentation

### Frontend Development

1. **Adding New Pages**:
   - Create a new HTML file in the frontend directory
   - Link to the page from the sidebar navigation
   - Create corresponding JavaScript file in the js directory

2. **Styling Guidelines**:
   - Follow the existing CSS patterns in styles.css
   - Use the defined color variables for consistency
   - Ensure responsive design for all screen sizes

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify MySQL is running
   - Check credentials in the .env file
   - Ensure the database exists and is properly initialized

2. **API Errors**:
   - Check server logs for detailed error messages
   - Verify API endpoints are correctly formatted
   - Ensure authentication tokens are valid and not expired

3. **Frontend Issues**:
   - Clear browser cache
   - Check browser console for JavaScript errors
   - Verify API base URL is correctly set in JavaScript files

### Getting Help

If you encounter issues not covered in this documentation:

1. Check the issue tracker for similar problems and solutions
2. Consult the project maintainers
3. Review the codebase for similar functionality

## Future Enhancements

- **Mobile Application**: Native mobile apps for on-the-go inventory management
- **Barcode Scanning**: Integration with barcode scanners for faster inventory updates
- **Advanced Analytics**: More sophisticated reporting and business intelligence features
- **Multi-location Support**: Manage inventory across multiple physical locations
- **Supplier Portal**: Allow suppliers to view and fulfill orders directly
- **Customer Portal**: Enable customers to place orders and track status

## License

This project is for academic purposes only. All rights reserved.

---

© 2023 Smart Inventory and Order Management System