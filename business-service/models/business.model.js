const mongoose = require("mongoose");

const BusinessSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      type: String,
    },
    role: {
      type: String,
      default: "Business",
    },
    businessVerified: {
      type: Boolean,
      default: false,
    },
    documents: {
      type: [String],
      default: [],
    },
    businessStatus: {
      type: String,
      enum: ["Unverified", "Pending", "Approved", "Rejected"],
      default: "Unverified",
    },
    rejectionReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Business", BusinessSchema);
