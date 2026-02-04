const mongoose = require("mongoose");

const compatibilitySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    livingSpace: {
      type: String,
      required: true,
      enum: ["apartment", "house_small", "house_large", "farm"],
    },
    activityLevel: {
      type: String,
      required: true,
      enum: ["sedentary", "moderate", "active", "very_active"],
    },
    workSchedule: {
      type: String,
      required: true,
      enum: ["home_all_day", "part_time_away", "full_time_away"],
    },
    petExperience: {
      type: String,
      required: true,
      enum: ["first_time", "some_experience", "experienced"],
    },
    household: {
      type: String,
      required: true,
      enum: ["single", "couple", "family_with_kids", "roommates"],
    },
    preferredEnergy: {
      type: String,
      required: true,
      enum: ["calm", "moderate", "energetic"],
    },
    timeForPet: {
      type: String,
      required: true,
      enum: ["limited", "moderate", "extensive"],
    },
    noiseTolerance: {
      type: String,
      required: true,
      enum: ["low", "moderate", "high"],
    },
    hasYard: {
      type: Boolean,
      default: false,
    },
    hasAllergies: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Compatibility", compatibilitySchema);
