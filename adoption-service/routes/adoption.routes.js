const express = require("express");
const router = express.Router();
const { authGuard, authorize } = require("../middleware/authGuard");
const adoptionController = require("../controllers/adoption.controller");


router.post(
  "/pets/:petId/adopt",
  authGuard,
  authorize("user"),
  adoptionController.applyAdoption
);

router.get(
  "/pets/:petId/status",
  authGuard,
  authorize("user"),
  adoptionController.getAdoptionStatus
);

router.get(
  "/history",
  authGuard,
  authorize("user"),
  adoptionController.getAdoptionHistory
);

router.get(
  "/pets/:petId",
  authGuard,
  authorize("business"),
  adoptionController.getPetAdoptions
);

router.put(
  "/:adoptionId/status",
  authGuard,
  authorize("business"),
  adoptionController.updateAdoptionStatus
);

router.patch(
  "/:adoptionId/mark-paid",
  authGuard,
  authorize("user"),
  adoptionController.markAdoptionPaid
);

module.exports = router;
