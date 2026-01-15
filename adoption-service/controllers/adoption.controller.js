const adoptionService = require("../services/adoption.service");

exports.applyAdoption = async (req, res) => {
  try {
    console.log("User from token:", req.user); // Debug log
    
    const adoption = await adoptionService.applyAdoption(
      req.user.id, // This should match decodedData.id
      req.params.petId,
      req.body
    );
    res.status(201).json({ success: true, adoption });
  } catch (err) {
    console.error("Apply adoption error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAdoptionStatus = async (req, res) => {
  try {
    console.log("User from token:", req.user); // Debug log
    
    const adoption = await adoptionService.getAdoptionStatus(
      req.user.id,
      req.params.petId
    );
    res.json({ success: true, adoption });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

exports.getAdoptionHistory = async (req, res) => {
  try {
    console.log("User from token:", req.user); // Debug log
    
    const adoptions = await adoptionService.getAdoptionHistory(req.user.id);
    res.json({ success: true, adoptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPetAdoptions = async (req, res) => {
  try {
    console.log("User from token:", req.user); // Debug log
    
    const adoptions = await adoptionService.getPetAdoptions(req.params.petId);
    res.json({ success: true, adoptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateAdoptionStatus = async (req, res) => {
  try {
    console.log("User from token:", req.user); // Debug log
    console.log("Body:", req.body);
    
    const { status } = req.body;
    let adoption;
    
    if (status === "approved") {
      adoption = await adoptionService.approveAdoption(
        req.params.adoptionId,
        req.user.id  // businessId from token
      );
    } else if (status === "rejected") {
      adoption = await adoptionService.rejectAdoption(
        req.params.adoptionId,
        req.user.id,  // businessId from token
        req.body.reason
      );
    } else {
      throw new Error("Invalid status. Use 'approved' or 'rejected'");
    }
    
    res.json({ success: true, adoption });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.markAdoptionPaid = async (req, res) => {
  try {
    console.log("User from token:", req.user); 
    
    const adoption = await adoptionService.markAdoptionPaid(
      req.params.adoptionId,
      req.user.id,
      req.body.paymentId
    );
    res.json({ success: true, adoption });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAdoptionById = async (req, res) => {
  try {
    console.log("Getting adoption by ID:", req.params.adoptionId);
    
    const adoption = await adoptionService.getAdoptionById(req.params.adoptionId);
    
    res.json({ 
      success: true, 
      adoption 
    });
  } catch (err) {
    console.error("Get adoption by ID error:", err);
    res.status(404).json({ 
      success: false, 
      message: err.message 
    });
  }
};