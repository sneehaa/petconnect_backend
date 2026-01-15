const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["Credit", "Debit"], required: true },
    description: { type: String },
    status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
