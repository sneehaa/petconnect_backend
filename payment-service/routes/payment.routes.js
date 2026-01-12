const express = require("express");
const router = express.Router();
const { authGuard, authorize } = require("../middleware/auth.middleware");
const paymentController = require("../controllers/payment.controller");

// User initiates Khalti payment
router.post(
  "/khalti/initiate",
  authGuard,
  authorize("user"),
  paymentController.initiatePayment
);

// Khalti verification (can be called by webhook)
router.post("/khalti/verify", paymentController.verifyPayment);

// User transaction history
router.get(
  "/transactions/my-history",
  authGuard,
  authorize("user"),
  paymentController.getMyTransactions
);

// Get receipt
router.get(
  "/receipts/:paymentId",
  authGuard,
  authorize("user"),
  paymentController.getReceiptByPaymentId
);

module.exports = router;
