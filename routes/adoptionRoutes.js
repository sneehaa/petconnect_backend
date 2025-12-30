const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

const {
  applyAdoption,
  getAdoptionStatus,
  updateAdoptionStatus,
  getPetAdoptions,
  getAdoptionHistory,
} = require("../controller/adoptionController");

router.post("/:id/adopt", protect, authorize("user"), applyAdoption);

router.get("/:id/adopt/status", protect, authorize("user"), getAdoptionStatus);

router.get("/history", protect, authorize("user"), getAdoptionHistory);

router.put(
  "/:appId/status",
  protect,
  authorize("business"),
  updateAdoptionStatus
);

router.get("/pet/:id", protect, authorize("business"), getPetAdoptions);

module.exports = router;
