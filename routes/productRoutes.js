import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Get all products
router.get("/api/products/", getProducts);


router.post("/api/products/", createProduct);

// Get a single product by ID
router.get("/api/products/:id", getProduct);

// Update a product by ID
router.put("/api/products/:id", updateProduct);

// Delete a product by ID
router.delete("/api/products/:id", deleteProduct);

export default router;
