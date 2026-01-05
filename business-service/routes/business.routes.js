const express = require("express");
const router = express.Router();
const businessController = require("../controller/business.controller");
const { authGuard, authGuardAdmin } = require("../middleware/authGuard");
const uploadBusinessDoc = require("../multer/business.multer");

router.post("/register", businessController.registerBusiness);
router.post("/login", businessController.loginBusiness);
router.get("/nearby", businessController.getNearbyBusinesses);
router.get("/:businessId", businessController.getBusinessDetails);

router.post(
  "/upload-document/:businessId",
  authGuard,
  uploadBusinessDoc.array("documents"),
  businessController.uploadDocuments
);
router.put("/profile", authGuard, businessController.updateProfile);
router.post("/profile", authGuard, businessController.createProfile);
router.get("/my-business", authGuard, businessController.getMyBusiness);

router.put(
  "/admin/approve/:businessId",
  authGuard,
  authGuardAdmin,
  businessController.approveBusiness
);
router.put(
  "/admin/reject/:businessId",
  authGuard,
  authGuardAdmin,
  businessController.rejectBusiness
);
router.get(
  "/admin/approved",
  authGuard,
  authGuardAdmin,
  businessController.getApprovedBusinesses
);
router.delete(
  "/admin/:businessId",
  authGuard,
  authGuardAdmin,
  businessController.deleteBusiness
);

module.exports = router;
