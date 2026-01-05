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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    message: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Adoption", adoptionSchema);
