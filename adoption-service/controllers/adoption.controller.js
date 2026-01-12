const adoptionService = require("../services/adoption.service");


exports.applyAdoption = async (req, res) => {
  try {
    const adoption = await adoptionService.applyAdoption(
      req.user._id,
      req.params.petId,
      req.body,
      req.headers.authorization 
    );
    res.status(201).json({ success: true, adoption });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.getAdoptionStatus = async (req, res) => {
  try {
    const adoption = await adoptionService.getAdoptionStatus(
      req.user._id,
      req.params.petId
    );
    res.json({ success: true, adoption });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};


exports.getAdoptionHistory = async (req, res) => {
  try {
    const adoptions = await adoptionService.getAdoptionHistory(req.user._id);
    res.json({ success: true, adoptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPetAdoptions = async (req, res) => {
  try {
    const adoptions = await adoptionService.getPetAdoptions(req.params.petId);
    res.json({ success: true, adoptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAdoptionStatus = async (req, res) => {
  try {
    const adoption = await adoptionService.updateAdoptionStatus(
      req.params.adoptionId,
      req.body.status
    );
    res.json({ success: true, adoption });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


exports.markAdoptionPaid = async (req, res) => {
  try {
    const adoption = await adoptionService.markAdoptionPaid(
      req.params.adoptionId,
      req.user._id,
      req.body.paymentId,
      req.headers.authorization
    );
    res.json({ success: true, adoption });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
