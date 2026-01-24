const express = require("express");
const router = express.Router();

const businessController = require("../controllers/business.controller");
const {
  authGuardBusiness,
  authGuardAdmin,
} = require("../middleware/authGuard");
const tempAuthGuard = require("../middleware/tempauth");

const {
  uploadBusinessDoc,
  uploadBusinessProfileImage,
} = require("../multer/business.multer");

router.post(
  "/register",
  uploadBusinessProfileImage.single("profileImage"),
  businessController.registerBusiness,
);

router.post("/verify-email", businessController.verifyBusinessEmail);

router.post("/resend-otp", businessController.sendOTP);

router.post("/login", businessController.loginBusiness);

router.get("/me", authGuardBusiness, businessController.getMyBusiness);

router.post(
  "/reset-password",
  authGuardBusiness,
  businessController.resetPassword,
);

router.post("/profile", authGuardBusiness, businessController.createProfile);

router.put(
  "/update-profile",
  authGuardBusiness,
  businessController.updateProfile,
);

router.put(
  "/profile-image",
  authGuardBusiness,
  uploadBusinessProfileImage.single("profileImage"),
  businessController.uploadProfileImage,
);

router.post(
  "/documents",
  authGuardBusiness,
  uploadBusinessDoc.single("document"),
  businessController.uploadDocuments,
);

router.post(
  "/upload-documents",
  tempAuthGuard,
  uploadBusinessDoc.single("document"),
  businessController.uploadDocuments,
);

router.put(
  "/adoptions/approve/:applicationId",
  authGuardBusiness,
  businessController.approveAdoption,
);

router.put(
  "/adoptions/reject/:applicationId",
  authGuardBusiness,
  businessController.rejectAdoption,
);

router.get("/admin/count", authGuardAdmin, businessController.getBusinessCount);

router.put(
  "/admin/approve/:businessId",
  authGuardAdmin,
  businessController.approveBusiness,
);

router.put(
  "/admin/reject/:businessId",
  authGuardAdmin,
  businessController.rejectBusiness,
);

router.get(
  "/admin/approved",
  authGuardAdmin,
  businessController.getApprovedBusinesses,
);

router.delete(
  "/admin/:businessId",
  authGuardAdmin,
  businessController.deleteBusiness,
);

router.get("/", businessController.getApprovedBusinesses);
router.get("/:businessId", businessController.getBusinessDetails);

module.exports = router;
