const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  role: {
    type: String,
    enum: ["user", "business", "admin"],
    required: true,
  },
  holds: [
    {
      adoptionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  transactions: [
    {
      transactionId: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ["credit", "debit", "hold", "release", "transfer"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "transactions.referenceModel",
      },
      referenceModel: {
        type: String,
        enum: ["Payment", "Adoption"],
      },
      status: {
        type: String,
        enum: ["success", "failed", "pending"],
        default: "pending",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Wallet", walletSchema);
