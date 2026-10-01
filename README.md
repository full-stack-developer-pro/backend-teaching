# Products CRUD API

A production-ready Express & MongoDB REST API demonstrating MVC architecture, layered service structure, error handling middleware, and complete CRUD operations for products.

---

## 📁 Project Structure

```text
node/
├── config/
│   └── db.js                  # MongoDB Mongoose connection configuration
├── controllers/
│   └── productController.js   # Request handlers and response formatters
├── middleware/
│   ├── loggerMiddleware.js    # Request logger middleware
│   └── errorMiddleware.js     # 404 handler and central error middleware
├── models/
│   └── productModel.js        # Mongoose Schema and Model for Products
├── routes/
│   └── productRoutes.js       # Product API endpoints and route definitions
├── services/
│   └── productService.js      # Business logic and database operations
├── utils/
│   ├── generateToken.js       # Helper utility for token generation
│   └── sendEmail.js           # Helper utility for sending emails
├── .env                       # Local environment variables
├── .env.example               # Template environment variables
├── app.js                     # Express app configuration & middleware pipeline
├── package.json               # Project metadata and dependencies
├── server.js                  # Server entry point and database startup
└── README.md
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or customize:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/products_db
NODE_ENV=development
```

### 3. Start MongoDB Server
Ensure MongoDB is running locally or provide a MongoDB Atlas URI in `.env`.

### 4. Run the Application
```bash
# Start development server with auto-reload
npm run dev

# Or start standard production server
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Get list of all products |
| `GET` | `/api/products/:id` | Get single product by MongoDB ID |
| `POST` | `/api/products` | Create a new product |
| `PUT` | `/api/products/:id` | Update an existing product |
| `DELETE` | `/api/products/:id` | Delete a product |

---

## 📦 Request / Response Examples

### 1. Create Product (`POST /api/products`)
**Request Body:**
```json
{
  "name": "Wireless Mechanical Keyboard",
  "price": 89.99,
  "description": "RGB Backlit with Hot-swappable switches",
  "category": "Electronics",
  "inStock": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "6724a1b2c3d4e5f678901234",
    "name": "Wireless Mechanical Keyboard",
    "price": 89.99,
    "description": "RGB Backlit with Hot-swappable switches",
    "category": "Electronics",
    "inStock": true,
    "createdAt": "2026-10-01T06:15:00.000Z",
    "updatedAt": "2026-10-01T06:15:00.000Z"
  }
}
```

### 2. Get All Products (`GET /api/products`)
**Response (200 OK):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6724a1b2c3d4e5f678901234",
      "name": "Wireless Mechanical Keyboard",
      "price": 89.99,
      "category": "Electronics",
      "inStock": true
    }
  ]
}
```
