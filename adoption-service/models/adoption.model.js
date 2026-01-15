const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema(
  {
    petId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    businessId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "payment_pending", "completed"],
      default: "pending",
    },
    rejectionReason: String,
    payment: {
      paymentId: String,
      isPaid: {
        type: Boolean,
        default: false,
      },
      amount: Number,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Adoption", adoptionSchema);
