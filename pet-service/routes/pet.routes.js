const express = require("express");
const router = express.Router();
const petController = require("../controllers/pet.controller");
const { authGuard } = require("../middleware/authGuard");
const uploadPetImages = require("../multer/pet.multer");

router.get("/", petController.getAllPets);
router.get("/business/:businessId", petController.getPetsByBusiness);
router.get("/:id", petController.getPetDetail);

router.post(
  "/",
  authGuard,
  uploadPetImages.array("photos", 5),
  petController.createPet,
);

router.put(
  "/:id",
  authGuard,
  uploadPetImages.array("photos", 5),
  petController.updatePet,
);

router.delete("/:id", authGuard, petController.deletePet);

module.exports = router;
