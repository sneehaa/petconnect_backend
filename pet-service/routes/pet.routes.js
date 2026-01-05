const express = require("express");
const router = express.Router();
const petController = require("../controller/pet.controller");
const { authGuard } = require("../middleware/auth");

// Public routes
router.get("/business/:businessId", petController.getPetsByBusiness);
router.get("/:id", petController.getPetDetail);
router.get("/", petController.getAllPets);

// Authenticated business routes
router.post(
  "/",
  authGuard,
  uploadPetImages.array("photos", 5),
  petController.createPet
);
router.post("/", authGuard, petController.createPet);
router.put("/:id", authGuard, petController.updatePet);
router.delete("/:id", authGuard, petController.deletePet);

module.exports = router;
