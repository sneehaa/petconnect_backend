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
    profileImage: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["BUSINESS"],
      default: "BUSINESS",
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
  },
);

BusinessSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("Business", BusinessSchema);
