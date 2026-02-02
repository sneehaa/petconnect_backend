const compatibilityService = require("../services/compatibility.service");

// Submit or update lifestyle questionnaire
exports.submitQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await compatibilityService.saveQuestionnaire(
      req.user.id,
      req.body
    );
    res.status(201).json({
      success: true,
      message: "Lifestyle questionnaire saved successfully",
      questionnaire,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// Get user's saved questionnaire
exports.getQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await compatibilityService.getQuestionnaire(
      req.user.id
    );
    res.json({
      success: true,
      questionnaire,
    });
  } catch (e) {
    res.status(404).json({
      success: false,
      message: e.message,
    });
  }
};

// Get compatibility score for a specific pet
exports.getCompatibilityWithPet = async (req, res) => {
  try {
    const result = await compatibilityService.getCompatibilityWithPet(
      req.user.id,
      req.params.petId
    );
    res.json({
      success: true,
      ...result,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// Get compatibility scores for all available pets
exports.getCompatibilityAll = async (req, res) => {
  try {
    const results = await compatibilityService.getCompatibilityAll(
      req.user.id
    );
    res.json({
      success: true,
      results,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

// Delete user questionnaire
exports.deleteQuestionnaire = async (req, res) => {
  try {
    await compatibilityService.deleteQuestionnaire(req.user.id);
    res.json({
      success: true,
      message: "Questionnaire deleted successfully",
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};
