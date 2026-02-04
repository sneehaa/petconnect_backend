const compatibilityService = require("../services/compatibility.service");

exports.submitQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await compatibilityService.saveQuestionnaire(
      req.user.id,
      req.body,
    );
    res.status(201).json({
      success: true,
      message: "Questionnaire saved successfully",
      questionnaire,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

exports.getQuestionnaire = async (req, res) => {
  try {
    const questionnaire = await compatibilityService.getQuestionnaire(
      req.user.id,
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

exports.getCompatibilityWithPet = async (req, res) => {
  try {
    const result = await compatibilityService.getCompatibilityWithPet(
      req.user.id,
      req.params.petId,
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

exports.getCompatibilityAll = async (req, res) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const results = await compatibilityService.getCompatibilityAll(
      req.user.id,
      parseInt(limit),
      parseInt(page),
    );
    res.json({
      success: true,
      ...results,
    });
  } catch (e) {
    res.status(400).json({
      success: false,
      message: e.message,
    });
  }
};

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
