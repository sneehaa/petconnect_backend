const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: String,
    businessId: String,
    paymentId: String,
    title: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "PROCESSING"],
      required: true,
    },
    type: {
      type: String,
      enum: ["PAYMENT", "PAYOUT"],
      default: "PAYMENT",
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
