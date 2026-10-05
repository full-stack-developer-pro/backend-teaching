# Backend Teaching Project: Express, MongoDB, Auth & RBAC

A modular, production-ready MERN backend built for teaching core backend concepts, including:
- **Chapter 8 & 9**: Complete Products CRUD & Layered MVC Architecture
- **Chapter 11**: User Authentication (bcrypt password hashing, JWT creation & verification, Protected routes)
- **Chapter 12**: Roles & Permissions (User vs Admin RBAC, 401 Unauthorized vs 403 Forbidden, Resource ownership checks)

---

## 📁 Project Architecture

```text
node/
├── config/
│   └── db.js                  # MongoDB Mongoose connection
├── controllers/
│   ├── authController.js      # Register, login, get current user, logout
│   ├── productController.js   # Product CRUD with auth & ownership verification
│   └── userController.js      # Admin user management & profile updates
├── middleware/
│   ├── authMiddleware.js      # JWT protect, role authorization (authorize, admin)
│   ├── errorMiddleware.js     # 404 handler and central error middleware
│   └── loggerMiddleware.js    # HTTP request logger
├── models/
│   ├── productModel.js        # Product schema with creator user reference
│   └── userModel.js           # User schema with bcrypt pre-save hash & matchPassword
├── routes/
│   ├── authRoutes.js          # /api/auth routes
│   ├── productRoutes.js       # /api/products routes
│   └── userRoutes.js          # /api/users routes (Admin & Owner protected)
├── services/
│   ├── authService.js         # Authentication business logic & JWT signing
│   ├── productService.js      # Product database operations
│   └── userService.js         # User database queries & operations
├── utils/
│   ├── generateToken.js       # JWT signing utility
│   └── sendEmail.js           # Email helper mock
├── .env                       # Environment variables (PORT, MONGO_URI, JWT_SECRET)
├── .env.example               # Environment variables template
├── app.js                     # Express app configuration & route mounts
├── package.json               # Dependencies & npm scripts
├── server.js                  # Server entry point
└── README.md
```

---

## 🔐 Chapter 11: User Authentication

### Concepts
1. **Password Hashing with `bcryptjs`**:
   - Passwords are never stored as plain text.
   - The [**`models/userModel.js`**](file:///d:/node/models/userModel.js) pre-save hook automatically hashes passwords with a salt factor of 10 before saving to MongoDB.
2. **JWT (JSON Web Token)**:
   - Generated via [**`utils/generateToken.js`**](file:///d:/node/utils/generateToken.js) upon register/login containing `{ userId, role }`.
3. **Protected Routes (`protect` middleware)**:
   - Clients send `Authorization: Bearer <token>` in the HTTP headers.
   - [**`middleware/authMiddleware.js`**](file:///d:/node/middleware/authMiddleware.js) verifies the token and attaches the user to `req.user`.

### Auth Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user (name, email, password, optional role) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `GET` | `/api/auth/me` | Private | Get profile of logged-in user (`protect`) |
| `POST` | `/api/auth/logout` | Private | Logout user acknowledgement |

---

## 🛡️ Chapter 12: Roles & Permissions

### Concepts
1. **Authentication vs Authorization**:
   - **Authentication (401 Unauthorized)**: Checks *who* you are. Fails if no token or token is invalid/expired.
   - **Authorization (403 Forbidden)**: Checks *what* you can do. Fails if you are logged in but lack the required role or ownership.
2. **Role-Based Access Control (RBAC)**:
   - `admin` middleware restricts routes exclusively to administrators (e.g. `GET /api/users`, `DELETE /api/users/:id`).
3. **Resource Ownership Checks**:
   - Regular users can only update their own profile (`PUT /api/users/:id`) or products they created (`PUT /api/products/:id`, `DELETE /api/products/:id`).
   - Admins bypass ownership checks to manage resources platform-wide.

### User & Admin Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users` | Private / Admin | View all users list |
| `GET` | `/api/users/:id` | Private / Admin or Owner | View single user profile |
| `PUT` | `/api/users/:id` | Private / Admin or Owner | Update user profile |
| `DELETE` | `/api/users/:id` | Private / Admin | Delete a user |

---

## 📡 Complete Products API

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List all products |
| `GET` | `/api/products/:id` | Public | Get single product |
| `POST` | `/api/products` | Private | Create product (stores creator user ID) |
| `PUT` | `/api/products/:id` | Private / Owner or Admin | Update product |
| `DELETE` | `/api/products/:id` | Private / Owner or Admin | Delete product |

---

## 🧪 Testing Examples

### 1. Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com", "password": "password123", "role": "user"}'
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "password123"}'
```
*Returns `{ "token": "eyJhbGci..." }`.*

### 3. Access Protected Profile (`401` if omitted, `200` if provided)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### 4. Test Admin-Only Route (`403 Forbidden` if role is "user", `200 OK` if role is "admin")
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```
