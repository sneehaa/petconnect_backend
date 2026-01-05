const businessService = require("../services/business.service");

// Register a new business
exports.registerBusiness = async (req, res) => {
  try {
    const business = await businessService.register(req.body);
    res.status(201).json({ success: true, business });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Login
exports.loginBusiness = async (req, res) => {
  try {
    const data = await businessService.login(req.body.username, req.body.password);
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
  }
};

// Upload documents
exports.uploadDocuments = async (req, res) => {
  try {
    await businessService.uploadDocuments(req.params.businessId, req.files);
    res.json({ success: true, message: "Documents uploaded" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Create / update profile
exports.createProfile = async (req, res) => {
  try {
    const business = await businessService.createProfile(req.user._id, req.body);
    res.status(200).json({ success: true, business });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const business = await businessService.updateProfile(req.user._id, req.body);
    res.status(200).json({ success: true, business });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Get my business
exports.getMyBusiness = async (req, res) => {
  try {
    const business = await businessService.getByUser(req.user._id);
    res.json({ success: true, business });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Get nearby businesses (formerly shelters)
exports.getNearbyBusinesses = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const businesses = await businessService.getNearby(latitude, longitude);
    res.status(200).json({ success: true, count: businesses.length, businesses });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Get business details with pets
exports.getBusinessDetails = async (req, res) => {
  try {
    const data = await businessService.getDetails(req.params.businessId);
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

// Approve business
exports.approveBusiness = async (req, res) => {
  try {
    await businessService.approve(req.params.businessId);
    res.json({ success: true, message: "Business approved" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Reject business
exports.rejectBusiness = async (req, res) => {
  try {
    await businessService.reject(req.params.businessId, req.body.reason);
    res.json({ success: true, message: "Business rejected" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Get all approved businesses
exports.getApprovedBusinesses = async (req, res) => {
  try {
    const businesses = await businessService.getApprovedBusinesses();
    res.json({ success: true, businesses });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Delete business (and associated pets)
exports.deleteBusiness = async (req, res) => {
  try {
    await businessService.deleteBusiness(req.params.businessId);
    res.json({ success: true, message: "Business and pets deleted successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
