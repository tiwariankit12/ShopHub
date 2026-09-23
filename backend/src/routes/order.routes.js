import express from "express";

import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import protect from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

// Create COD / Razorpay order
router.post("/", protect, createOrder);

// Verify Razorpay payment
router.post(
  "/verify",
  protect,
  verifyPayment
);

// Logged-in user's orders
router.get(
  "/my-orders",
  protect,
  getMyOrders
);

// Admin - all orders
router.get(
  "/all",
  protect,
  adminOnly,
  getAllOrders
);

// Admin - update order status
router.put(
  "/:id/status",
  protect,
  adminOnly,
  updateOrderStatus
);

export default router;