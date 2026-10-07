import express from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getCategories)
  .post(protect, admin, createCategory);

router.route("/:id")
  .get(validateObjectId("id"), getCategory)
  .put(protect, admin, validateObjectId("id"), updateCategory)
  .delete(protect, admin, validateObjectId("id"), deleteCategory);

export default router;
