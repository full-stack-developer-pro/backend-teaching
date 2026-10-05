import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import loggerMiddleware from "./middleware/loggerMiddleware.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

// Base API Welcome Route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Backend Teaching API (Auth, RBAC & CRUD)",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me (Protected)",
        logout: "POST /api/auth/logout (Protected)",
      },
      users: {
        getAllUsers: "GET /api/users (Admin only)",
        getUserById: "GET /api/users/:id (Admin or Owner)",
        updateUser: "PUT /api/users/:id (Admin or Owner)",
        deleteUser: "DELETE /api/users/:id (Admin only)",
      },
      products: {
        getAllProducts: "GET /api/products",
        getProductById: "GET /api/products/:id",
        createProduct: "POST /api/products (Protected)",
        updateProduct: "PUT /api/products/:id (Protected / Owner / Admin)",
        deleteProduct: "DELETE /api/products/:id (Protected / Owner / Admin)",
      },
    },
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
