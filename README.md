# Backend Teaching Project: Security, Relationships & Advanced API Features

A complete, beginner-friendly MERN backend codebase demonstrating:
- **Chapter 8 & 9**: Complete Products CRUD & Layered MVC Architecture
- **Chapter 11**: User Authentication (bcrypt password hashing, JWT creation & verification)
- **Chapter 12**: Roles & Permissions (User vs Admin RBAC, 401 vs 403, Resource ownership)
- **Chapter 13**: Backend Security Basics (Helmet, Rate limiting, CORS, Input validation, Protected secrets)
- **Chapter 14**: MongoDB Relationships (ObjectId, References, `.populate()`, One-to-One, One-to-Many, Many-to-Many concepts)
- **Chapter 15**: Advanced API Features (Pagination, Search, Filtering, Sorting, Date filters, Selecting fields, Reusable query logic)

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
│   ├── productController.js   # Product -> Category & User (with advanced query features)
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

## ⚡ Chapter 15: Advanced API Features

All query features are implemented directly using native Mongoose methods (`find()`, `skip()`, `limit()`, `sort()`, `select()`, and `$regex`):

### 1. Pagination
Divides large datasets into pages using `.skip((page - 1) * limit).limit(limit)`.
```http
GET /api/products?page=2&limit=20
```
Returns data along with pagination metadata:
```json
{
  "total": 45,
  "page": 2,
  "limit": 20,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPrevPage": true
}
```

### 2. Search
Performs case-insensitive keyword searches using `$regex`:
```http
GET /api/products?search=iphone
```

### 3. Filtering
Filters by exact fields or comparisons (`gte`, `gt`, `lte`, `lt`):
```http
GET /api/products?category=670987...&inStock=true
GET /api/products?price[gte]=100&price[lte]=500
```

### 4. Sorting
Sorts ascending or descending (`-` prefix):
```http
GET /api/products?sort=price        # Ascending (lowest to highest)
GET /api/products?sort=-price       # Descending (highest to lowest)
GET /api/products?sort=-createdAt   # Newest first (default)
```

### 5. Date Filters
Filters records created within a specific date range:
```http
GET /api/products?startDate=2026-01-01&endDate=2026-12-31
GET /api/orders?startDate=2026-10-01&endDate=2026-10-31
```

### 6. Selecting Fields
Reduces response size by returning only requested fields:
```http
GET /api/products?fields=name,price,category
```

### 7. Combining All Features Together
```http
GET /api/products?search=phone&sort=price&page=1&limit=10&fields=name,price,category&startDate=2026-01-01
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

| Relationship | Type | Implementation | Example Endpoint |
|---|---|---|---|
| **User $\rightarrow$ Posts** | One-to-Many | [**`models/postModel.js`**](file:///d:/node/models/postModel.js) has `user` ref | `GET /api/posts` (populates author) |
| **Product $\rightarrow$ Category** | Many-to-One | [**`models/productModel.js`**](file:///d:/node/models/productModel.js) has `category` ref | `GET /api/products` (populates category) |
| **Order $\rightarrow$ User & Products** | Many-to-Many / Embedded | [**`models/orderModel.js`**](file:///d:/node/models/orderModel.js) has `user` ref & `orderItems.product` refs | `GET /api/orders/:id` (populates user & products) |

---

## 📡 API Endpoints Reference

### 1. Categories (`/api/categories`)
- `GET /api/categories` — Get all categories
- `GET /api/categories/:id` — Get single category
- `POST /api/categories` — Create category (Admin only)
- `PUT /api/categories/:id` — Update category (Admin only)
- `DELETE /api/categories/:id` — Delete category (Admin only)

### 2. Posts (`/api/posts`)
- `GET /api/posts` — Get all posts (supports `search`, `page`, `limit`, `sort`)
- `GET /api/posts/myposts` — Get posts created by logged-in user (`protect`)
- `GET /api/posts/user/:userId` — Get posts created by specific user
- `GET /api/posts/:id` — Get single post by ID
- `POST /api/posts` — Create post (Logged-in User)
- `PUT /api/posts/:id` — Update post (Author or Admin)
- `DELETE /api/posts/:id` — Delete post (Author or Admin)

### 3. Orders (`/api/orders`)
- `POST /api/orders` — Place an order (Logged-in User)
- `GET /api/orders/myorders` — Get my orders (supports `startDate`, `endDate`, `page`, `limit`)
- `GET /api/orders/user/:userId` — Get orders for a specific user (Owner or Admin)
- `GET /api/orders/:id` — Get order details (Owner or Admin)
- `GET /api/orders` — Get all platform orders (Admin only - supports `startDate`, `endDate`, `status`, `page`, `limit`)

### 4. Products (`/api/products`)
- `GET /api/products` — Get all products (supports `search`, `category`, `price[gte]`, `sort`, `fields`, `page`, `limit`, `startDate`, `endDate`)
- `GET /api/products/myproducts` — Get products created by logged-in user
- `GET /api/products/user/:userId` — Get products created by specific user
- `GET /api/products/:id` — Get single product
- `POST /api/products` — Create product (Logged-in User)
- `PUT /api/products/:id` — Update product (Owner or Admin)
- `DELETE /api/products/:id` — Delete product (Owner or Admin)

### 5. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register user (Rate limited)
- `POST /api/auth/login` — Login & get JWT (Rate limited)
- `GET /api/auth/me` — Get current profile (`protect`)
- `POST /api/auth/logout` — Logout user
