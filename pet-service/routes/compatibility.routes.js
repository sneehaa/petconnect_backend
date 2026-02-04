const express = require("express");
const router = express.Router();
const compatibilityController = require("../controllers/compatibility.controller");
const { authGuard } = require("../middleware/authGuard");

router.use(authGuard);

router.post("/questionnaire", compatibilityController.submitQuestionnaire);
router.get("/questionnaire", compatibilityController.getQuestionnaire);
router.delete("/questionnaire", compatibilityController.deleteQuestionnaire);
router.get("/", compatibilityController.getCompatibilityAll);
router.get("/:petId", compatibilityController.getCompatibilityWithPet);

module.exports = router;
