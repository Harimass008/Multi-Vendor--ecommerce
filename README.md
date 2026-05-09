# 🛍️ Multi-Vendor eCommerce System

A full-stack multi-vendor eCommerce platform built with **Node.js + Express + MongoDB** (Backend) and **React + Zustand + Tailwind CSS** (Frontend).

---

## 📁 Project Structure

```
multivendor-ecommerce/
├── backend/
│   ├── config/
│   │   └── cloudinary.js          # Cloudinary image upload config
│   ├── controllers/
│   │   ├── auth.controller.js     # Register, Login, JWT, Password Reset
│   │   ├── product.controller.js  # Product CRUD, Search, Filters
│   │   ├── cart.controller.js     # Cart management (multi-vendor)
│   │   ├── order.controller.js    # Order placement, split logic, tracking
│   │   └── misc.controller.js     # Admin, User, Vendor, Payment, Review, Wishlist, Coupon, Notification
│   ├── middleware/
│   │   └── auth.middleware.js     # JWT auth, RBAC, vendor check
│   ├── models/
│   │   ├── User.model.js          # User schema with bcrypt
│   │   ├── Vendor.model.js        # Vendor profile + approval
│   │   ├── Product.model.js       # Product with text index
│   │   └── index.js               # Category, Cart, Order, Review, Wishlist, Coupon, Notification
│   ├── routes/                    # All API routes
│   ├── utils/
│   │   ├── jwt.utils.js           # Token generation/verification
│   │   ├── email.utils.js         # Nodemailer email templates
│   │   └── response.utils.js      # ApiError, ApiResponse, asyncHandler
│   ├── server.js                  # Express app entry point
│   └── .env.example               # Environment variables template
│
└── frontend/
    └── src/
        ├── api/index.js           # Axios instance + all API calls
        ├── store/index.js         # Zustand stores (auth, cart, notifications)
        ├── layouts/               # UserLayout, VendorLayout, AdminLayout
        ├── pages/
        │   ├── user/              # Home, ProductList, ProductDetail, Cart, Checkout, Orders, Profile, Wishlist
        │   ├── vendor/            # Dashboard, Products, ProductForm, Orders, Profile
        │   └── admin/             # Dashboard, Users, Vendors, Orders, Products, Categories, Coupons
        └── App.jsx                # Routes with role-based protection
```

---

## 🚀 Features Implemented

### 👤 User
- Register / Login with JWT
- Browse & search products with filters (category, price, rating, sort)
- Add to cart (multi-vendor), update quantity, remove items
- Apply coupon codes at checkout
- Place orders with address management
- Track order status (pending → paid → shipped → delivered → completed)
- Cancel orders
- Write verified product reviews & ratings
- Wishlist management
- Profile & address management
- Forgot/reset password via email

### 🏪 Vendor
- Register (requires admin approval)
- Full dashboard with revenue charts, sales stats, low-stock alerts
- Product CRUD with image upload via Cloudinary
- Manage orders — update status (paid → processing → shipped → delivered → completed)
- Add tracking numbers
- View detailed store analytics

### ⚙️ Admin
- Dashboard with total users, vendors, orders, revenue, sales trend
- Approve / Reject vendor applications with email notifications
- Ban / Unban users
- View all orders and users
- Manage product categories
- Create coupon codes (percentage or fixed)
- View all products across vendors

---

## ⚡ Tech Stack

| Layer         | Technology                                |
|---------------|-------------------------------------------|
| Backend       | Node.js, Express.js                       |
| Database      | MongoDB (Mongoose)                        |
| Auth          | JWT (access + refresh tokens), bcryptjs   |
| Image Upload  | Cloudinary + Multer                       |
| Email         | Nodemailer                                |
| Frontend      | React 18, React Router v6                 |
| State Mgmt    | Zustand (with persist)                    |
| Styling       | Tailwind CSS                              |
| HTTP Client   | Axios (with token refresh interceptor)    |
| Charts        | Recharts                                  |

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account (for email)

---

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy env file
cp .env.example .env

# Fill in .env values:
# - MONGO_URI: your MongoDB connection string
# - JWT_ACCESS_SECRET, JWT_REFRESH_SECRET: random strong strings
# - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
# - EMAIL_HOST, EMAIL_USER, EMAIL_PASS

# Start development server
npm run dev
```

**Server runs on:** `http://localhost:5000`

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**App runs on:** `http://localhost:5173`

---

### Create Admin Account

Connect to MongoDB and run:
```js
db.users.insertOne({
  name: "Admin",
  email: "admin@shophub.com",
  password: "$2a$12$...", // bcrypt hash of your password
  role: "admin",
  isActive: true,
  isBanned: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use this Node.js script:
```js
// create-admin.js (run from backend folder)
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User.model');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await User.create({
    name: 'Admin',
    email: 'admin@shophub.com',
    password: 'Admin@123',  // will be auto-hashed
    role: 'admin',
    isActive: true,
  });
  console.log('Admin created!');
  process.exit(0);
});
```

---

## 🌐 API Endpoints

### Auth
```
POST /api/auth/user/register
POST /api/auth/user/login
POST /api/auth/vendor/register
POST /api/auth/vendor/login
POST /api/auth/admin/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Products
```
GET  /api/products              → list with filters/search/sort/pagination
GET  /api/products/:id          → single product + related
GET  /api/products/categories   → all categories
POST /api/products/vendor/create       → create (vendor)
PUT  /api/products/vendor/:id          → update (vendor)
DELETE /api/products/vendor/:id        → delete (vendor)
GET  /api/products/vendor/my-products  → vendor's products
```

### Cart
```
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/update
DELETE /api/cart/remove/:id
DELETE /api/cart/clear
```

### Orders
```
POST /api/orders/create
GET  /api/orders/user
GET  /api/orders/:id
PUT  /api/orders/:id/cancel
GET  /api/vendors/orders          → vendor orders
PUT  /api/vendors/orders/:id/status → update order status
```

### Admin
```
GET /api/admin/dashboard
GET /api/admin/users
PUT /api/admin/users/:id/ban
GET /api/admin/vendors
PUT /api/admin/vendors/:id/approve
GET /api/admin/orders
GET /api/admin/categories
POST /api/admin/categories
POST /api/admin/coupons
```

---

## 🔑 Key Business Logic

### Multi-Vendor Cart Split
When a user places an order, the single cart is automatically split into separate vendor sub-orders. Each vendor can only see and manage their own orders.

### Order Status Flow
```
pending → paid → processing → shipped → delivered → completed
                                                  ↘ return_requested → returned
```

### Vendor Approval
- Vendor registers → status: `pending`
- Admin approves/rejects via dashboard
- Email notification sent to vendor
- Only approved vendors can manage products & orders

### JWT Token Flow
- Access token: 15 minutes
- Refresh token: 7 days
- Axios interceptor auto-refreshes expired access tokens

---

## 📱 Application URLs

| URL                      | Description          |
|--------------------------|----------------------|
| `http://localhost:5173/` | Customer Homepage    |
| `/products`              | Product Listing      |
| `/products/:id`          | Product Detail       |
| `/cart`                  | Shopping Cart        |
| `/checkout`              | Checkout             |
| `/orders`                | Order History        |
| `/wishlist`              | Wishlist             |
| `/login`                 | User Login           |
| `/register`              | User Register        |
| `/vendor/login`          | Vendor Login         |
| `/vendor/register`       | Vendor Registration  |
| `/vendor`                | Vendor Dashboard     |
| `/vendor/products`       | Vendor Products      |
| `/vendor/orders`         | Vendor Orders        |
| `/admin/login`           | Admin Login          |
| `/admin`                 | Admin Dashboard      |
| `/admin/vendors`         | Vendor Management    |
| `/admin/users`           | User Management      |

---

## 🔧 Optional Enhancements

- **Redis**: Add caching for product listings and sessions
- **Razorpay/Stripe**: Replace mock payment with real integration
- **Socket.io**: Real-time chat between user and vendor
- **Bulk Upload**: CSV product import for vendors
- **PWA**: Add service workers for offline support
#   M u l t i - V e n d o r - - e c o m m e r c e  
 