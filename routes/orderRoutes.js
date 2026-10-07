import express from "express";
import {
  createOrder,
  getOrder,
  getMyOrders,
  getAllOrders,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, createOrder)
  .get(protect, admin, getAllOrders);

router.route("/myorders")
  .get(protect, getMyOrders);

router.route("/:id")
  .get(protect, validateObjectId("id"), getOrder);

export default router;
