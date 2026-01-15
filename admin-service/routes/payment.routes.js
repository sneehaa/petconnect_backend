const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");

// Get all payments
router.get("/", paymentController.getAllPayments);

// Get payment by ID
router.get("/:paymentId", paymentController.getPaymentById);

module.exports = router;
