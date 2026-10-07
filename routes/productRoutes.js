import express from "express";
import {
  getProducts,
  getProduct,
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

router.route("/:id")
  .get(validateObjectId("id"), getProduct)
  .put(protect, validateObjectId("id"), updateProduct)
  .delete(protect, validateObjectId("id"), deleteProduct);

export default router;
