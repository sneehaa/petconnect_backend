import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["DEBIT", "CREDIT"], default: "DEBIT" },
    status: { type: String, enum: ["SUCCESS", "FAILED"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
