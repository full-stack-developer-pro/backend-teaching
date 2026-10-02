import express from "express";
import cors from "cors";
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
    message: "Welcome to Products CRUD API",
    endpoints: {
      getAllProducts: "GET /api/products",
      getProductById: "GET /api/products/:id",
      createProduct: "POST /api/products",
      updateProduct: "PUT /api/products/:id",
      deleteProduct: "DELETE /api/products/:id",
    },
  });
});

// Mount Routes
app.use(productRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
