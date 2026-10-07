# Backend Teaching Project: Security & MongoDB Relationships

A complete, beginner-friendly MERN backend codebase demonstrating:
- **Chapter 8 & 9**: Complete Products CRUD & Layered MVC Architecture
- **Chapter 11**: User Authentication (bcrypt password hashing, JWT creation & verification)
- **Chapter 12**: Roles & Permissions (User vs Admin RBAC, 401 vs 403, Resource ownership)
- **Chapter 13**: Backend Security Basics (Helmet, Rate limiting, CORS, Input validation, Protected secrets)
- **Chapter 14**: MongoDB Relationships (ObjectId, References, `.populate()`, One-to-One, One-to-Many, Many-to-Many concepts)

---

## 📁 Project Architecture

```text
node/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── authController.js      # Register, login, profile, logout
│   ├── categoryController.js  # Category CRUD
│   ├── orderController.js     # Orders referencing User & Products
│   ├── postController.js      # User -> Posts (One-to-Many)
│   ├── productController.js   # Product -> Category & User
│   └── userController.js      # User management & admin actions
├── middleware/
│   ├── authMiddleware.js      # protect (JWT) & authorize / admin (RBAC)
│   ├── errorMiddleware.js     # 404 handler & central error middleware
│   ├── loggerMiddleware.js    # Request logger
│   ├── rateLimiter.js         # express-rate-limit (API & Auth limiters)
│   └── validateMiddleware.js  # ObjectId format and required field validation
├── models/
│   ├── categoryModel.js       # Category Schema
│   ├── orderModel.js          # Order Schema (User + array of Product refs)
│   ├── postModel.js           # Post Schema (User ref - One-to-Many)
│   ├── productModel.js        # Product Schema (Category & User refs)
│   └── userModel.js           # User Schema (bcrypt pre-save hook)
├── routes/
│   ├── authRoutes.js          # /api/auth endpoints (rate limited)
│   ├── categoryRoutes.js      # /api/categories endpoints
│   ├── orderRoutes.js         # /api/orders endpoints
│   ├── postRoutes.js          # /api/posts endpoints
│   ├── productRoutes.js       # /api/products endpoints
│   └── userRoutes.js          # /api/users endpoints
├── services/
│   ├── authService.js         # Authentication logic
│   ├── categoryService.js     # Category DB queries
│   ├── orderService.js        # Order DB queries with nested populate
│   ├── postService.js         # Post DB queries with user populate
│   ├── productService.js      # Product DB queries with category/user populate
│   └── userService.js         # User DB queries
├── utils/
│   ├── generateToken.js       # JWT signing helper
│   └── sendEmail.js           # Email helper mock
├── .env                       # Environment variables (ignored by git)
├── .env.example               # Template environment variables
├── app.js                     # Express setup with Helmet, CORS, Rate limiting
├── server.js                  # Server entry point
└── package.json               # Dependencies & scripts
```

---

## 🔒 Chapter 13: Backend Security Basics

1. **Environment Variables (`.env`)**:
   - Secrets (`MONGO_URI`, `JWT_SECRET`) are kept in `.env` and excluded via `.gitignore`.
2. **Security Headers (`helmet`)**:
   - Adds essential HTTP security headers (XSS filter, Content Security Policy, Hide X-Powered-By, etc.).
3. **CORS Configuration**:
   - Restricts API access to allowed origins, methods, and headers.
4. **Rate Limiting (`express-rate-limit`)**:
   - `apiLimiter`: 100 requests per 15 minutes for general API routes.
   - `authLimiter`: 10 requests per 15 minutes for `/api/auth/register` and `/api/auth/login` to prevent brute force.
5. **Input & ObjectId Validation**:
   - [**`middleware/validateMiddleware.js`**](file:///d:/node/middleware/validateMiddleware.js) rejects malformed IDs with `400 Bad Request` before database queries run.
6. **No Sensitive Data in Responses**:
   - `select("-password")` is used when returning user data; stack traces are hidden in production mode.

---

## 🔗 Chapter 14: Relationships in MongoDB

### Concepts

1. **ObjectId References (`type: mongoose.Schema.Types.ObjectId, ref: 'ModelName'`):**
   - Instead of duplicating full documents, MongoDB stores the `_id` of the related document.
2. **`populate()` Method:**
   - Automatically joins and replaces the `ObjectId` with the actual referenced document fields at query time.
   ```javascript
   // Example in postService.js:
   const posts = await Post.find().populate("user", "name email");
   ```

### Relationship Examples in This Project

| Relationship | Type | Implementation | Example Endpoint |
|---|---|---|---|
| **User $\rightarrow$ Posts** | One-to-Many | [**`models/postModel.js`**](file:///d:/node/models/postModel.js) has `user` ref | `GET /api/posts` (populates author) |
| **Product $\rightarrow$ Category** | Many-to-One | [**`models/productModel.js`**](file:///d:/node/models/productModel.js) has `category` ref | `GET /api/products` (populates category) |
| **Order $\rightarrow$ User & Products** | Many-to-Many / Embedded | [**`models/orderModel.js`**](file:///d:/node/models/orderModel.js) has `user` ref & `orderItems.product` refs | `GET /api/orders/:id` (populates user & products) |

---

## 📡 API Endpoints Reference

### 1. Categories (`/api/categories`)
- `GET /api/categories` — Get all categories (Public)
- `GET /api/categories/:id` — Get single category (Public)
- `POST /api/categories` — Create category (Admin only)
- `PUT /api/categories/:id` — Update category (Admin only)
- `DELETE /api/categories/:id` — Delete category (Admin only)

### 2. Posts (`/api/posts`) — *User $\rightarrow$ Posts*
- `GET /api/posts` — Get all posts with author details (Public)
- `GET /api/posts/:id` — Get single post (Public)
- `POST /api/posts` — Create post (Logged-in User)
- `PUT /api/posts/:id` — Update post (Author or Admin)
- `DELETE /api/posts/:id` — Delete post (Author or Admin)

### 3. Orders (`/api/orders`) — *Order $\rightarrow$ User & Products*
- `POST /api/orders` — Place an order (Logged-in User)
- `GET /api/orders/myorders` — Get my orders (Logged-in User)
- `GET /api/orders/:id` — Get order details (Owner or Admin)
- `GET /api/orders` — Get all platform orders (Admin only)

### 4. Products (`/api/products`) — *Product $\rightarrow$ Category & User*
- `GET /api/products` — Get all products (populates category & creator)
- `GET /api/products/:id` — Get single product
- `POST /api/products` — Create product (Logged-in User)
- `PUT /api/products/:id` — Update product (Owner or Admin)
- `DELETE /api/products/:id` — Delete product (Owner or Admin)

### 5. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register user (Rate limited)
- `POST /api/auth/login` — Login & get JWT (Rate limited)
- `GET /api/auth/me` — Get current profile (`protect`)
- `POST /api/auth/logout` — Logout user
