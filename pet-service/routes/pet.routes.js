const express = require("express");
const router = express.Router();

const petController = require("../controllers/pet.controller");
const { authGuard } = require("../middleware/authGuard");
const uploadPetImages = require("../multer/pet.multer");

// Get all pets
router.get("/", petController.getAllPets);

// Get pets by business
router.get("/business/:businessId", petController.getPetsByBusiness);

// Get pet by ID (dynamic route)
router.get("/:id", petController.getPetDetail);

// Create pet (with images)
router.post(
  "/",
  authGuard,
  uploadPetImages.array("photos", 5),
  petController.createPet,
);

// Update pet
router.put(
  "/:id",
  authGuard,
  uploadPetImages.array("photos", 5),
  petController.updatePet,
);

// Delete pet
router.delete("/:id", authGuard, petController.deletePet);

module.exports = router;
