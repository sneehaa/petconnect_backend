const express = require("express");
const router = express.Router();

// Middleware
const adminMiddleware = require("../middleware/admin.middleware");
const authMiddleware = require("../middleware/auth.middleware");

// Controller
const transactionController = require("../controllers/transaction.controller");

// Routes
router.get("/", authMiddleware, adminMiddleware, transactionController.getAllTransactions);
router.put("/:transactionId/approve", adminMiddleware, transactionController.approveTransaction);

module.exports = router;
