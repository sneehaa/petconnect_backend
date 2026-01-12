import mongoose from "mongoose";

const receiptSchema = new mongoose.Schema(
  {
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    receiptNumber: { type: String, unique: true, required: true },
    issuedTo: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
    receiptUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("Receipt", receiptSchema);
