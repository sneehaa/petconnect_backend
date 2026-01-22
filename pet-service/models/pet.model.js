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
    available: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Pet", petSchema);
