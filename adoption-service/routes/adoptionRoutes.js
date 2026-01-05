const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const adoptionController = require("../controllers/adoption.controller");

// User applies for adoption
router.post(
  "/pets/:petId/adopt",
  protect,
  authorize("user"),
  adoptionController.applyAdoption
);

// User checks adoption status
router.get(
  "/pets/:petId/status",
  protect,
  authorize("user"),
  adoptionController.getAdoptionStatus
);

// User sees adoption history
router.get("/history", protect, authorize("user"), adoptionController.getAdoptionHistory);

// Business sees adoption applications for their pet
router.get(
  "/pets/:petId",
  protect,
  authorize("business"),
  adoptionController.getPetAdoptions
);

// Business approves/rejects adoption
router.put(
  "/:adoptionId/status",
  protect,
  authorize("business"),
  adoptionController.updateAdoptionStatus
);

module.exports = router;
