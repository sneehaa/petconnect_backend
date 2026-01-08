const express = require("express");
const router = express.Router();

const petController = require("../controller/pet.controller");
const { authGuard } = require("../middleware/authGuard");
const uploadPetImages = require("../multer/pet.multer");


// Get all pets
router.get("/", petController.getAllPets);

// Get pet by ID
router.get("/:id", petController.getPetDetail);

// Get pets by business
router.get("/business/:businessId", petController.getPetsByBusiness);

// Create pet (with images)
router.post(
  "/",
  authGuard,
  uploadPetImages.array("photos", 5),
  petController.createPet
);

router.put(
  "/:id",
  authGuard,
  uploadPetImages.array("photos", 5),
  petController.updatePet
);

router.delete(
  "/:id",
  authGuard,
  petController.deletePet
);

module.exports = router;
