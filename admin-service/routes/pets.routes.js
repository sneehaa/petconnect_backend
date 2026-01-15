const express = require("express");
const router = express.Router();

// Destructure if your middleware is exported as named exports
const authMiddleware = require("../middleware/auth.middleware"); // function
const adminMiddleware = require("../middleware/admin.middleware"); // function

const petController = require("../controllers/pet.controller");

// ----------------------
// Routes
// ----------------------

// Get all pets (any authenticated user)
router.get("/", authMiddleware, petController.getAllPets);

// Delete a pet (admin only)
router.delete("/:petId", adminMiddleware, petController.removePet);

module.exports = router;
