# MERN Masterclass — Full Connected React Frontend (Chapter 17)

A sleek, modern React frontend built with **Vite** and **Vanilla CSS** that connects to **every single REST API** built in our Node.js + Express + MongoDB backend.

---

## 🚀 How to Run the App

You need two terminals:

### 1. Backend Terminal:
```bash
# In project root (d:\node)
npm run dev
```
> Server runs on: `http://localhost:5000`

### 2. Frontend Terminal:
```bash
# In d:\node
npm run frontend

# OR navigate to frontend directory:
cd frontend
npm run dev
```
> React App runs on: `http://localhost:5173`

---

## 🛡️ Role-Based Access Control (RBAC) Architecture

The frontend dynamically changes controls and tabs depending on who is logged in:

| Feature / Action | 🌐 Public Guest | 👤 Regular User | 👑 Administrator | Backend Endpoint |
| :--- | :---: | :---: | :---: | :--- |
| **Browse Products, Search, Sort & Paginate** | ✅ | ✅ | ✅ | `GET /api/products` |
| **Quick View Product Details** | ✅ | ✅ | ✅ | `GET /api/products/:id` |
| **Create Product** (Local or Cloudinary) | ❌ | ✅ | ✅ | `POST /api/products` + `POST /api/upload[/cloud]` |
| **My Created Products Filter** | ❌ | ✅ | ✅ | `GET /api/products/myproducts` |
| **Edit / Delete Own Products** | ❌ | ✅ (Own only) | ✅ (All products) | `PUT /api/products/:id`, `DELETE /api/products/:id` |
| **Place Order (1-Click Checkout)** | ❌ | ✅ | ✅ | `POST /api/orders` |
| **View My Order Receipts** | ❌ | ✅ | ✅ | `GET /api/orders/myorders`, `GET /api/orders/:id` |
| **View All Platform Customer Orders** | ❌ | ❌ | ✅ | `GET /api/orders` |
| **Community Posts Feed** | ✅ | ✅ | ✅ | `GET /api/posts` |
| **Publish Blog Post** | ❌ | ✅ | ✅ | `POST /api/posts` |
| **My Posts Filter & Edit/Delete** | ❌ | ✅ (Own only) | ✅ (All posts) | `GET /api/posts/myposts`, `PUT /api/posts/:id` |
| **Admin Hub: Categories CRUD** | ❌ | ❌ | ✅ | `GET, POST, PUT, DELETE /api/categories` |
| **Admin Hub: Users Directory & Roles** | ❌ | ❌ | ✅ | `GET /api/users`, `DELETE /api/users/:id` |
| **Admin Hub: Multi-Upload to Cloud** | ❌ | ❌ | ✅ | `POST /api/upload/cloud/multiple` |
| **Admin Hub: Delete Cloudinary Image** | ❌ | ❌ | ✅ | `DELETE /api/upload/cloud` |
| **User Profile Management** | ❌ | ✅ | ✅ | `GET /api/auth/me`, `PUT /api/users/:id` |
| **Logout** | ❌ | ✅ | ✅ | `POST /api/auth/logout` |

---

## ⚡ 1-Click Demo Testing

Inside the **Login / Register** tab:
- Click **"👑 Log In as Admin"** to test with full administrative powers (Admin Hub, category management, user deletion, cloud media manager).
- Click **"👤 Log In as User"** to test standard customer features (order history, my products, community posts).
