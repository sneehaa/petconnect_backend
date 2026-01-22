const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

// ---------------------
// Dashboard home
// ---------------------
router.get("/", (req, res) => {
  res.json({ success: true, message: "Admin Dashboard Home" });
});

// ---------------------
// Get total stats
// ---------------------
router.get("/stats", async (req, res) => {
  try {
    // Call the existing controller
    await dashboardController.getDashboardStats(req, res);
  } catch (err) {
    console.error("Error in /dashboard/stats route:", err.message || err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats"
    });
  }
});

module.exports = router;
