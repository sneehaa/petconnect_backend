const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    vaccinated: {
      type: Boolean,
      default: false,
    },
    description: String,
    personality: String,
    medicalInfo: String,
    photos: {
      type: [String],
      default: [],
    },
    businessId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "booked", "adopted"],
      default: "available",
    },
    adoptedBy: {
      type: String,
      default: null,
    },
    adoptedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pet", petSchema);
