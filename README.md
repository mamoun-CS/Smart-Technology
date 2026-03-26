# Smart Technology E-Commerce Platform

## 📋 What This Code Does

This is a **full-stack e-commerce web application** for a technology store called "Smart Technology". It includes everything needed to run an online store:

### Backend (Node.js/Express)
- **User Authentication**: Register, login, email verification, password reset, OAuth (Google/Facebook)
- **Product Management**: Create, edit, delete products with categories, images, pricing (wholesale/retail), barcodes, stock tracking
- **Shopping Cart**: Add/remove items, update quantities, persistent cart per user
- **Order Processing**: Create orders, track status (pending → shipped → delivered), order history
- **Admin Panel**: Dashboard with sales analytics, user management, trader approval, low-stock alerts
- **Trader Dashboard**: Manage own products, view orders
- **Real-time Chat**: Socket.io live chat support
- **Email Notifications**: Welcome emails, order confirmations, password reset
- **SEO**: Dynamic sitemap generation

### Frontend (Next.js 14)
- **Multi-language**: English and Arabic (RTL support)
- **Pages**: Home, Products, Cart, Login, Register, Orders, Trader Dashboard, Admin Dashboard
- **State Management**: Auth and Cart using Zustand
- **UI**: Tailwind CSS, responsive design, dark mode, toast notifications

---

A full-stack e-commerce web application built with Node.js/Express backend and Next.js frontend. Supports multiple languages (English & Arabic), role-based access control, product management, shopping cart, order processing, and admin/trader dashboards with real-time chat support.

## 🚀 Features

### Backend Features

- **Authentication System**
  - JWT-based authentication with access/refresh tokens
  - Email/password registration and login
  - Role-based access control (Admin, Trader, Customer)
  - Password reset via email tokens
  - Email verification
  - Passport.js OAuth integration (Google, Facebook)

- **Product Management**
  - CRUD operations for products
  - Category management
  - Product images support
  - Barcode and warehouse location tracking
  - Wholesale and retail pricing
  - Stock management with low-stock alerts
  - Product search with filters (price, category, rating, stock)
  - Advanced sorting options
  - Product reviews and ratings

- **Shopping Cart**
  - Add/remove items
  - Quantity updates
  - Persistent cart per user

- **Order Management**
  - Order creation and tracking
  - Multiple order statuses (pending, processing, shipped, delivered, cancelled)
  - Order history
  - Order items with detailed pricing

- **Admin Dashboard**
  - User statistics
  - Sales analytics
  - Trader approval system
  - Low stock alerts
  - Active offers management

- **Email Integration**
  - Welcome emails
  - Order confirmation
  - Password reset
  - Email verification

- **Real-time Features**
  - Socket.io live chat support
  - Real-time notifications
  - Online user tracking

- **SEO Features**
  - Dynamic sitemap generation
  - Meta tags optimization

### Frontend Features

- **Multi-language Support**
  - English and Arabic (RTL)
  - Dynamic language switching

- **Pages**
  - Home page with featured products
  - Product listing with filtering and sorting
  - Shopping cart
  - User authentication (login/register)
  - Email verification page
  - Order history
  - Trader dashboard
  - Admin dashboard

- **State Management**
  - Auth store (Zustand)
  - Cart store (Zustand)

- **UI/UX**
  - Tailwind CSS styling
  - Responsive design
  - Dark mode support
  - Toast notifications

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL (recommended) / MySQL
- JWT for authentication
- Bcrypt for password hashing
- NodeMailer for emails
- Socket.io for real-time features

### Frontend
- Next.js 14 (App Router)
- React
- Tailwind CSS
- Zustand (state management)
- Lucide React (icons)
- Sonner (toast notifications)
- Socket.io-client (real-time chat)

## 📁 Project Structure

```
Smart technology/
├── backend/
│   ├── controllers/       # Request handlers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── productController.js
│   ├── middleware/         # Auth & RBAC middleware
│   │   ├── auth.js
│   │   └── rbac.js
│   ├── models/            # Database models
│   │   ├── cartModel.js
│   │   ├── db.js
│   │   ├── orderModel.js
│   │   ├── productModel.js
│   │   ├── tokenModel.js
│   │   └── userModel.js
│   ├── routes/            # API routes
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── products.js
│   ├── utils/             # Utilities
│   │   ├── email.js
│   │   ├── jwt.js
│   │   └── passport.js
│   ├── .env               # Environment variables
│   ├── package.json
│   └── server.js          # Entry point
├── database/
│   ├── schema.sql         # Database schema
│   └── insertdata.sql     # Sample data
├── frontend/
│   ├── app/[locale]/      # Next.js pages with i18n
│   │   ├── admin/         # Admin pages
│   │   ├── cart/          # Cart page
│   │   ├── login/         # Login page
│   │   ├── orders/        # Orders page
│   │   ├── products/      # Products page
│   │   ├── register/      # Register page
│   │   ├── trader/       # Trader dashboard
│   │   └── verify-email/  # Email verification
│   ├── components/        # Reusable components
│   │   ├── AuthProvider.js
│   │   └── Navbar.js
│   ├── i18n/              # Translations
│   │   ├── ar.json
│   │   ├── en.json
│   │   └── index.js
│   ├── lib/               # Utilities
│   │   ├── api.js         # API client
│   │   └── utils.js
│   ├── store/             # State management
│   │   ├── authStore.js
│   │   └── cartStore.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL or MySQL
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (create `.env` file):
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_tech
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
CLIENT_URL=http://localhost:3000
```

4. Set up database:
```bash
# Create database and run schema
psql -U postgres -f ../database/schema.sql

# Optionally insert sample data
psql -U postgres -d smart_tech -f ../database/insertdata.sql
```

5. Start the server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (create `.env.local` file):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify/:token` - Verify email
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/facebook` - Facebook OAuth login

### Products
- `GET /api/products` - Get all products (with filters & sorting)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin/Trader)
- `PUT /api/products/:id` - Update product (Admin/Trader)
- `DELETE /api/products/:id` - Delete product (Admin)
- `GET /api/products/categories` - Get all categories
- `POST /api/products/categories` - Create category (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `GET /api/orders` - Get user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/traders/pending` - Get pending traders
- `POST /api/admin/traders/:id/approve` - Approve trader
- `POST /api/admin/traders/:id/reject` - Reject trader

### SEO
- `GET /api/sitemap.xml` - Dynamic sitemap

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Customer** | Browse products, manage cart, place orders, view order history |
| **Trader** | All customer permissions + create/edit own products |
| **Admin** | Full access: manage users, products, categories, orders, view analytics |

## 🌐 Internationalization

The application supports:
- **English (en)** - LTR layout
- **Arabic (ar)** - RTL layout

Language can be changed via the URL prefix (e.g., `/en/products` or `/ar/products`).

## 📝 Database Schema

Key tables:
- `users` - User accounts with roles
- `products` - Product listings
- `categories` - Product categories
- `cart_items` - Shopping cart items
- `orders` - Order records
- `order_items` - Items in each order
- `password_reset_tokens` - Password reset tokens
- `verification_tokens` - Email verification tokens
- `shipping_areas` - Shipping zones and costs
- `reviews` - Product reviews and ratings

## 🎨 Customization

### Adding a new language
1. Create translation JSON file in `frontend/i18n/`
2. Update `frontend/i18n/index.js` to include the new locale

### Adding new roles
1. Add role to database schema
2. Update RBAC middleware in `backend/middleware/rbac.js`
3. Add role checks in controllers

## 📄 License

This project is for educational purposes.
