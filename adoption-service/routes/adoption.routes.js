const express = require("express");
const router = express.Router();
const { authGuard } = require("../middleware/authGuard");
const adoptionController = require("../controllers/adoption.controller");

// All routes use only authGuard (no authorize middleware)
router.post("/pets/:petId/adopt", authGuard, adoptionController.applyAdoption);
router.get(
  "/pets/:petId/status",
  authGuard,
  adoptionController.getAdoptionStatus
);
router.get("/history", authGuard, adoptionController.getAdoptionHistory);
router.get("/pets/:petId", authGuard, adoptionController.getPetAdoptions);
router.put(
  "/:adoptionId/status",
  authGuard,
  adoptionController.updateAdoptionStatus
);
router.patch(
  "/:adoptionId/mark-paid",
  authGuard,
  adoptionController.markAdoptionPaid
);

router.get("/:adoptionId", authGuard, adoptionController.getAdoptionById);

module.exports = router;
