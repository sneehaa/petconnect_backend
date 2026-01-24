const adoptionService = require("../services/adoption.service");

exports.applyAdoption = async (req, res) => {
  try {
    const adoption = await adoptionService.applyAdoption(
      req.user.id,
      req.params.petId,
      req.body,
    );
    res.status(202).json({
      success: true,
      message: "Adoption application is being processed",
      adoption,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateAdoptionStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const { adoptionId } = req.params;
    let result;

    if (status === "approved") {
      result = await adoptionService.approveAdoption(adoptionId, req.user.id);
    } else if (status === "rejected") {
      result = await adoptionService.rejectAdoption(
        adoptionId,
        req.user.id,
        reason,
      );
    } else {
      throw new Error("Invalid status");
    }

    res.json({
      success: true,
      message: `Adoption ${status} successfully`,
      adoption: result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAdoptionStatus = async (req, res) => {
  try {
    const adoption = await adoptionService.getAdoptionStatus(
      req.user.id,
      req.params.petId,
    );
    res.json({ success: true, adoption });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.getPetAdoptions = async (req, res) => {
  try {
    const adoptions = await adoptionService.getAdoptionsByPet(req.params.petId);
    res.json({ success: true, adoptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdoptionHistory = async (req, res) => {
  try {
    const adoptions = await adoptionService.getAdoptionHistory(req.user.id);
    res.json({ success: true, adoptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAdoptionById = async (req, res) => {
  try {
    const adoption = await adoptionService.getAdoptionById(
      req.params.adoptionId,
    );
    res.json({ success: true, adoption });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.markAdoptionPaid = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;
    const result = await adoptionService.markAdoptionPaid(
      req.params.adoptionId,
      req.user.id,
      paymentId,
      amount,
    );
    res.json({ success: true, adoption: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
