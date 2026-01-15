const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: String,
    businessId: String,
    type: {
      type: String,
      enum: ["email", "sms", "in_app"],
      required: true
    },
    subject: String,
    message: String,
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending"
    },
    sentAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);