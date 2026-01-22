const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const {
  authGuard,
  authGuardAdmin,
  authGuardBusiness,
} = require("../middleware/auth.middleware");

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
router.get("/:paymentId", authGuard, paymentController.getPaymentDetails);

router.get(
  "/business/earnings",
  authGuardBusiness,
  paymentController.getBusinessEarnings,
);

router.get(
  "/admin/transactions",
  authGuard,
  authGuardAdmin,
  paymentController.getAllTransactions,
);

module.exports = router;
