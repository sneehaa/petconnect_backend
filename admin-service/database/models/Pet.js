const mongoose = require("mongoose");

const PetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    age: { type: Number, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "Business" },
    status: { type: String, enum: ["Available","Adopted","Removed"], default: "Available" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pet", PetSchema);
