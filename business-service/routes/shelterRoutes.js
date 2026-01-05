const express = require("express");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const {
  createShelter,
  getNearbyShelters,
  getShelterDetails,
  updateShelter,
  deleteShelter,
} = require("../controller/shelterController");

router.post("/", protect, authorize("user", "business"), createShelter);
router.get(
  "/nearby",
  protect,
  authorize("user", "shelter", "business"),
  getNearbyShelters
);

router.get(
  "/:id",
  protect,
  authorize("user", "shelter", "business"),
  getShelterDetails
);
router.put("/:id", protect, authorize("shelter"), updateShelter);
router.delete("/:id", protect, authorize("shelter"), deleteShelter);

module.exports = router;
