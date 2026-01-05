const express = require("express");
const router = express.Router();
const businessController = require("../controller/business.controller");
const {
  authGuardBusiness,
  authGuardAdmin,
} = require("../middleware/authGuard");
const uploadBusinessDoc = require("../multer/business.multer");

// PUBLIC
router.post("/register", businessController.registerBusiness);
router.post("/login", businessController.loginBusiness);
router.get("/nearby", businessController.getNearbyBusinesses);
router.get("/:businessId", businessController.getBusinessDetails);

// AUTHENTICATED BUSINESS
router.get("/me", authGuardBusiness, businessController.getMyBusiness);
router.post("/profile", authGuardBusiness, businessController.createProfile);
router.put("/profile", authGuardBusiness, businessController.updateProfile);
router.post(
  "/documents",
  authGuardBusiness,
  uploadBusinessDoc.array("documents"),
  businessController.uploadDocuments
);

// ADMIN
router.put(
  "/admin/approve/:businessId",
  authGuardAdmin,
  businessController.approveBusiness
);
router.put(
  "/admin/reject/:businessId",
  authGuardAdmin,
  businessController.rejectBusiness
);
router.get(
  "/admin/approved",
  authGuardAdmin,
  businessController.getApprovedBusinesses
);
router.delete(
  "/admin/:businessId",
  authGuardAdmin,
  businessController.deleteBusiness
);

module.exports = router;
