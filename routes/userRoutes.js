import express from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .get(admin, getUsers);

router.route("/:id")
  .get(validateObjectId("id"), getUser)
  .put(validateObjectId("id"), updateUser)
  .delete(admin, validateObjectId("id"), deleteUser);

export default router;
