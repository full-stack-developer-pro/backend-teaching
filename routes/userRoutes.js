import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All user routes require authentication (protect)
router.use(protect);

// Admin-only: Get all users
router.route("/")
  .get(admin, getUsers);

// Admin or Owner: Get single user, Update user; Admin-only: Delete user
router.route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(admin, deleteUser);

export default router;
