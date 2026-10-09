import express from "express";
import {
  getProducts,
  getProduct,
  getMyProducts,
  getUserProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getProducts)
  .post(protect, createProduct);

// Get products created by currently logged-in user
router.get("/myproducts", protect, getMyProducts);

// Get products created by a specific user ID
router.get("/user/:userId", validateObjectId("userId"), getUserProducts);

router.route("/:id")
  .get(validateObjectId("id"), getProduct)
  .put(protect, validateObjectId("id"), updateProduct)
  .delete(protect, validateObjectId("id"), deleteProduct);

export default router;
