const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    businessStatus: { type: String, enum: ["Unverified","Pending","Approved","Rejected"], default: "Unverified" },
    rejectionReason: { type: String },
    documents: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Business", BusinessSchema);
