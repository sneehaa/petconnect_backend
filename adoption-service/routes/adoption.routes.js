const express = require("express");
const router = express.Router();
const { authGuard, authGuardAdmin, authorize } = require("../middleware/authGuard");
const adoptionController = require("../controller/adoption.controller");

// User applies for adoption
router.post(
  "/pets/:petId/adopt",
  authGuard,
  authorize("user"),
  adoptionController.applyAdoption
);

// User checks adoption status
router.get(
  "/pets/:petId/status",
  authGuard,
  authorize("user"),
  adoptionController.getAdoptionStatus
);

// User sees adoption history
router.get("/history", authGuard, authorize("user"), adoptionController.getAdoptionHistory);

// Business sees adoption applications for their pet
router.get(
  "/pets/:petId",
  authGuard,
  authorize("business"),
  adoptionController.getPetAdoptions
);

// Business approves/rejects adoption
router.put(
  "/:adoptionId/status",
  authGuard,
  authorize("business"),
  adoptionController.updateAdoptionStatus
);

module.exports = router;
