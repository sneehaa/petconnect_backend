const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");

router.post("/email", notificationController.sendEmail);
router.post("/adoption-approved", notificationController.sendAdoptionApproved);
router.post("/adoption-rejected", notificationController.sendAdoptionRejected);
router.get("/user", notificationController.getUserNotifications);

module.exports = router;