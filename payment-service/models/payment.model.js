const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    adoptionId: {
      type: String,
      required: true,
    },
    referenceId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ["KHALTI"],
      default: "KHALTI",
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    paidAt: {
      type: Date,
    },
    khalti: {
      pidx: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
