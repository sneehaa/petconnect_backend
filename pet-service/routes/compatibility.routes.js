const express = require("express");
const router = express.Router();

const compatibilityController = require("../controllers/compatibility.controller");
const { authGuard } = require("../middleware/authGuard");

// All compatibility routes require authentication
router.use(authGuard);

// Submit or update lifestyle questionnaire
router.post("/questionnaire", compatibilityController.submitQuestionnaire);

// Get user's saved questionnaire
router.get("/questionnaire", compatibilityController.getQuestionnaire);

// Delete user's questionnaire
router.delete("/questionnaire", compatibilityController.deleteQuestionnaire);

// Get compatibility scores for all available pets
router.get("/", compatibilityController.getCompatibilityAll);

// Get compatibility score for a specific pet
router.get("/:petId", compatibilityController.getCompatibilityWithPet);

module.exports = router;
