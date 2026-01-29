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
    businessId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "payment_pending", "completed"],
      default: "pending",
    },
    applicationDetails: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      address: { type: String, required: true },
      homeType: {
        type: String,
        enum: ["House", "Apartment", "Other"],
        required: true,
      },
      hasYard: {
        type: Boolean,
        default: false,
      },
      employmentStatus: String,
      numberOfAdults: Number,
      numberOfChildren: Number,
      hasOtherPets: {
        type: Boolean,
        default: false,
      },
      otherPetsDetails: String,
      hoursPetAlone: Number,
      previousPetExperience: String,
      message: String,
    },
    rejectionReason: String,
    payment: {
      paymentId: String,
      isPaid: {
        type: Boolean,
        default: false,
      },
      amount: Number,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Adoption", adoptionSchema);
