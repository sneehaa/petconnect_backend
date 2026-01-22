const express = require("express");
const Business = require("../models/business.model.js");

const router = express.Router();

// GET /api/business/admin/count
router.get("/admin/count", async (req, res) => {
  try {
    const totalBusinesses = await Business.countDocuments();

    res.json({
      totalBusinesses
    });
  } catch (err) {
    console.error("Error fetching business count:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch business count"
    });
  }
});

module.exports = router;
