const express = require("express");
const router = express.Router();
const notificationController = require("../controller/notification.controller");
const { authGuard, authGuardBusiness } = require("../middleware/authGuard");

router.post("/adoption-approved", authGuard, notificationController.sendAdoptionApproved);
router.post("/adoption-rejected", authGuard, notificationController.sendAdoptionRejected);
router.get("/user",authGuard, notificationController.getUserNotifications);
router.get("/business", authGuardBusiness , notificationController.getBusinessNotifications);

module.exports = router;
