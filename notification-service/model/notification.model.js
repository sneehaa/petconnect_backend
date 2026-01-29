const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: false,
    },
    businessId: {
      type: String,
      required: false,
    },
    type: {
      type: String,
      enum: ["email", "sms", "in_app"],
      required: true,
    },
    subject: String,
    message: String,
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    sentAt: Date,
  },
  { timestamps: true },
);

module.exports = mongoose.model("Notification", notificationSchema);
