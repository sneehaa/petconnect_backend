import express from "express";
import { initiatePayment, verifyPayment } from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected route: /khalti/initiate requires JWT
router.post("/khalti/initiate", authMiddleware, initiatePayment);

// Public route: /khalti/verify is open for Khalti callbacks
router.post("/khalti/verify", verifyPayment);

export default router;
