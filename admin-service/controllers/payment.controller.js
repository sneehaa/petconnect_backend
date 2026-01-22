const Payment = require("../database/models/Payment"); // or Transaction if you store payments there
const response = require("../utils/response");
const logger = require("../utils/logger");

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("business", "name")
      .populate("pet", "name species")
      .sort({ createdAt: -1 });

    return response.success(res, { payments });
  } catch (err) {
    logger.error("Get all payments error:", err);
    return response.error(res, "Failed to fetch payments", 500);
  }
};

// Get single payment by ID
exports.getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate("user", "name email")
      .populate("business", "name")
      .populate("pet", "name species");

    if (!payment) return response.error(res, "Payment not found", 404);

    return response.success(res, { payment });
  } catch (err) {
    logger.error("Get payment by ID error:", err);
    return response.error(res, "Failed to fetch payment", 500);
  }
};
