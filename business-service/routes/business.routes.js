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

// Register route with profile image upload
router.post(
  "/register",
  uploadBusinessProfileImage.single("profileImage"),
  businessController.registerBusiness,
);

router.post("/login", businessController.loginBusiness);

router.get("/nearby", businessController.getNearbyBusinesses);
router.post(
  "/reset-password",
  authGuardBusiness,
  businessController.resetPassword,
);
router.get("/", businessController.getApprovedBusinesses);
router.get("/:businessId", businessController.getBusinessDetails);

router.get("/", businessController.getApprovedBusinesses);

router.get("/me", authGuardBusiness, businessController.getMyBusiness);

router.post("/profile", authGuardBusiness, businessController.createProfile);

router.put(
  "/update-profile",
  authGuardBusiness,
  businessController.updateProfile,
);

router.post(
  "/documents",
  authGuardBusiness,
  uploadBusinessDoc.single("document"),
  businessController.uploadDocuments,
);

router.put(
  "/profile-image",
  authGuardBusiness,
  uploadBusinessProfileImage.single("profileImage"),
  businessController.uploadProfileImage,
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

router.get("/:businessId", businessController.getBusinessDetails);

module.exports = router;

module.exports = router;
