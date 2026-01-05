const mongoose = require("mongoose");

const adoptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Review", "Approved", "Rejected"],
    default: "Pending",
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  formData: {
    type: Object,
  },
});

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
    vaccinated: {
      type: Boolean,
      default: false,
    },
    description: String,
    personality: String,
    medicalInfo: String,
    photos: [String],
    videos: [String],
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    adoptionHistory: [adoptionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", petSchema);
