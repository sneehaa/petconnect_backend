// admin-service/controllers/transaction.controller.js
const Transaction = require("../database/models/Transaction");
const logger = require("../utils/logger");
const response = require("../utils/response");

// ----------------------------
// Get all transactions
// ----------------------------
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    return response.success(res, { transactions });
  } catch (err) {
    logger.error("Get all transactions error:", err);
    return response.error(res, "Failed to fetch transactions", 500);
  }
};

// ----------------------------
// Get single transaction details
// ----------------------------
exports.getTransactionById = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return response.error(res, "Transaction not found", 404);

    return response.success(res, { transaction });
  } catch (err) {
    logger.error("Get transaction by ID error:", err);
    return response.error(res, "Failed to fetch transaction", 500);
  }
};

// ----------------------------
// Approve transaction
// ----------------------------
exports.approveTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return response.error(res, "Transaction not found", 404);

    if (transaction.status !== "pending") {
      return response.error(res, `Transaction already ${transaction.status}`, 400);
    }

    transaction.status = "approved";
    transaction.approvedBy = req.user.id; // track who approved
    transaction.approvedAt = new Date();

    await transaction.save();

    return response.success(res, { transaction });
  } catch (err) {
    logger.error("Approve transaction error:", err);
    return response.error(res, "Failed to approve transaction", 500);
  }
};

// ----------------------------
// Reject transaction
// ----------------------------
exports.rejectTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return response.error(res, "Transaction not found", 404);

    if (transaction.status !== "pending") {
      return response.error(res, `Transaction already ${transaction.status}`, 400);
    }

    transaction.status = "rejected";
    transaction.rejectedBy = req.user.id; // track who rejected
    transaction.rejectedAt = new Date();

    await transaction.save();

    return response.success(res, { transaction });
  } catch (err) {
    logger.error("Reject transaction error:", err);
    return response.error(res, "Failed to reject transaction", 500);
  }
};
