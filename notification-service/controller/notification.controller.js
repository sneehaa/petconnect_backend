const notificationService = require("../service/notification.service");
const notificationRepo = require("../repositories/notification.repository");

exports.sendAdoptionApproved = async (req, res) => {
  try {
    const { userId, petName } = req.body;
    const result = await notificationService.notifyAdoptionApproved(
      userId,
      petName,
    );
    res.json({ success: true, notification: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.sendAdoptionRejected = async (req, res) => {
  try {
    const { userId, petName, reason } = req.body;
    const result = await notificationService.notifyAdoptionRejected(
      userId,
      petName,
      reason,
    );
    res.json({ success: true, notification: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await notificationRepo.findByUserId(req.user.id);
    res.json({ success: true, notifications });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
