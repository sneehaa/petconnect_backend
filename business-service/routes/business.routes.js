const express = require("express");
const router = express.Router();
const businessController = require("../controllers/business.controller");
const {
  authGuardBusiness,
  authGuardAdmin,
} = require("../middleware/authGuard");
const tempAuthGuard = require("../middleware/tempauth");
const uploadBusinessDoc = require("../multer/business.multer");

// =====================
// PUBLIC
// =====================
router.post("/register", businessController.registerBusiness);
router.post("/login", businessController.loginBusiness);
<<<<<<< HEAD
router.get("/nearby", businessController.getNearbyBusinesses);
router.post("/reset-password", authGuardBusiness, businessController.resetPassword);
=======
router.get("/", businessController.getApprovedBusinesses)
>>>>>>> 4fef8b60fd1a565ebb5ad287c89035cd1fd56a01
router.get("/:businessId", businessController.getBusinessDetails);

// =====================
// AUTHENTICATED BUSINESS
// =====================
router.get("/me", authGuardBusiness, businessController.getMyBusiness);
router.post("/profile", authGuardBusiness, businessController.createProfile);
router.put("/update-profile", authGuardBusiness, businessController.updateProfile);

router.post(
  "/upload-documents",
  tempAuthGuard,
  uploadBusinessDoc.single("document"),
  businessController.uploadDocuments
);

// ✅ APPROVE ADOPTION (BUSINESS ONLY)
router.put(
  "/adoptions/approve/:applicationId",
  authGuardBusiness,
  businessController.approveAdoption
);

// ✅ REJECT ADOPTION (BUSINESS ONLY)
router.put(
  "/adoptions/reject/:applicationId",
  authGuardBusiness,
  businessController.rejectAdoption
);

// =====================
// ADMIN
// =====================
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
