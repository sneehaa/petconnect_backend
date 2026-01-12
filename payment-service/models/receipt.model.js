const mongoose = require("mongoose");

const ReceiptSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    receiptNumber: {
      type: String,
      unique: true,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", ReceiptSchema);