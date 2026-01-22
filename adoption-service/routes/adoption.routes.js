const express = require("express");
const router = express.Router();
const { authGuard } = require("../middleware/authGuard");
const adoptionController = require("../controllers/adoption.controller");

router.get("/internal/:adoptionId", adoptionController.getAdoptionById);

router.use(authGuard);

router.post("/pets/:petId/adopt", adoptionController.applyAdoption);
router.get("/pets/:petId/status", adoptionController.getAdoptionStatus);
router.get("/history", adoptionController.getAdoptionHistory);
router.get("/pets/:petId", adoptionController.getPetAdoptions);
router.put("/:adoptionId/status", adoptionController.updateAdoptionStatus);
router.patch("/:adoptionId/mark-paid", adoptionController.markAdoptionPaid);
router.get("/:adoptionId", adoptionController.getAdoptionById);

module.exports = router;
