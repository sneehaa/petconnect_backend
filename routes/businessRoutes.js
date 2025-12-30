const express = require("express");
const router = express.Router();
const businessController = require("../controller/businessController");
const { authGuard, authGuardAdmin } = require("../middleware/authGuard");
const uploadBusinessDoc = require('../multer/business.multer'); 


router.post("/register", businessController.register);

router.post("/login", businessController.loginBusiness);

router.post("/sendOTP", businessController.sendOTP);
router.post("/resendOTP", businessController.resendOTP);

router.post("/verifyOTP", businessController.verifyOTP);

router.post("/updatePassword", businessController.updatePassword);

router.post(
  "/upload-document",
  authGuard,
  uploadBusinessDoc.single("document"),
);

router.get(
  "/admin/getAll",
  authGuard,
  authGuardAdmin,
  businessController.getAllBusinesses
);

router.put(
  "/admin/approve/:businessId",
  authGuard,
  authGuardAdmin,
  businessController.approveBusiness
);

module.exports = router;