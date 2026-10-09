import express from "express";
import {
  createOrder,
  getOrder,
  getMyOrders,
  getUserOrders,
  getAllOrders,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createOrder)
  .get(admin, getAllOrders);

// Get orders for currently logged-in user
router.get("/myorders", getMyOrders);

// Get orders for a specific user (Owner or Admin)
router.get("/user/:userId", validateObjectId("userId"), getUserOrders);

router.route("/:id")
  .get(validateObjectId("id"), getOrder);

export default router;
