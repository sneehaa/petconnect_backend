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
    adoptionPolicy: {
      type: String,
    },
    address: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    role: {
      type: String,
      enum: ["BUSINESS"],
      default: "BUSINESS",
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

BusinessSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Business", BusinessSchema);
