const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const {
  authGuard,
  authGuardAdmin,
  authGuardBusiness,
} = require("../middleware/auth.middleware");

// User routes
router.post("/wallet/load", authGuard, paymentController.loadWallet);
router.get("/wallet/balance", authGuard, paymentController.getWalletBalance);
router.get(
  "/wallet/transactions",
  authGuard,
  paymentController.getTransactionHistory,
);
router.post("/initiate", authGuard, paymentController.initiatePayment);
router.post("/process", authGuard, paymentController.processPayment);
router.get("/user/payments", authGuard, paymentController.getUserPayments);
router.get(
  "/summary/:paymentId",
  authGuard,
  paymentController.getPaymentSummary,
);
router.get("/:paymentId", authGuard, paymentController.getPaymentDetails);

// Business routes
router.get(
  "/business/earnings",
  authGuardBusiness,
  paymentController.getBusinessEarnings,
);
router.get(
  "/business/wallet/balance",
  authGuardBusiness,
  paymentController.getBusinessWalletBalance,
);
router.get(
  "/business/wallet/transactions",
  authGuardBusiness,
  paymentController.getBusinessTransactions,
);

// Admin routes
router.get(
  "/admin/transactions",
  authGuard,
  authGuardAdmin,
  paymentController.getAllTransactions,
);
router.get(
  "/admin/wallets",
  authGuard,
  authGuardAdmin,
  paymentController.getAllWallets,
);

module.exports = router;
