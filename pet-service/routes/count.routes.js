const express = require("express");
const Pet = require("../models/pet.model.js");

const router = express.Router();

// GET /api/pets/count
router.get("/count", async (req, res) => {
  try {
    const totalPets = await Pet.countDocuments();

    res.json({
      totalPets
    });
  } catch (err) {
    console.error("Error fetching pet count:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pet count"
    });
  }
});

module.exports = router;
