const express = require("express");
const router = express.Router();
const businessController = require("../controller/business.controller");
const { authGuard, authGuardAdmin } = require("../middleware/authGuard");
const uploadBusinessDoc = require("../multer/business.multer");

// Public
router.post("/register", businessController.registerBusiness);
router.post("/login", businessController.loginBusiness);

// Authenticated business routes
router.post(
  "/upload-document/:businessId",
  authGuard,
  uploadBusinessDoc.array("documents"),
  businessController.uploadDocuments
);
router.get("/my-business", authGuard, businessController.getMyBusiness);

// Admin routes
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

module.exports = router;
