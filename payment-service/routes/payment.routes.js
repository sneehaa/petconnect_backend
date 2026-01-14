// routes/payment.routes.js
const express = require("express");
const router = express.Router();
const { authGuard } = require("../middleware/auth.middleware"); 
const paymentController = require("../controllers/payment.controller");


// User initiates Khalti payment
router.post("/khalti/initiate", authGuard, paymentController.initiatePayment);

// Khalti verification
router.post("/khalti/verify", paymentController.verifyPayment);

// User transaction history
router.get("/transactions/my-history", authGuard, paymentController.getMyTransactions);

// Get receipt
router.get("/receipts/:paymentId", authGuard, paymentController.getReceiptByPaymentId);

module.exports = router;