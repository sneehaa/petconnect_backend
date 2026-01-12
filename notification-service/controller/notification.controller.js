const notificationService = require("../services/notification.service");

exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    const result = await notificationService.sendEmail(to, subject, text);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.sendAdoptionApproved = async (req, res) => {
  try {
    const { userEmail, petName } = req.body;
    const result = await notificationService.notifyAdoptionApproved(userEmail, petName);
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.sendAdoptionRejected = async (req, res) => {
  try {
    const { userEmail, petName, reason } = req.body;
    const result = await notificationService.notifyAdoptionRejected(userEmail, petName, reason);
    res.json({ success: true, ...result });
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