const Notification = require("../models/notification.model");

class NotificationRepository {
  create(data) {
    return Notification.create(data);
  }

  findByUserId(userId) {
    return Notification.find({ userId }).sort({ createdAt: -1 });
  }

  findByBusinessId(businessId) {
    return Notification.find({ businessId }).sort({ createdAt: -1 });
  }

  updateStatus(id, status) {
    return Notification.findByIdAndUpdate(
      id,
      { status, sentAt: status === "sent" ? new Date() : null },
      { new: true }
    );
  }
}

module.exports = new NotificationRepository();