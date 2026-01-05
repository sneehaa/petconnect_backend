const businessService = require("../services/business.service");

// PUBLIC
exports.registerBusiness = async (req, res) => {
  try {
    const business = await businessService.register(req.body);
    res.status(201).json({ success: true, business });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.loginBusiness = async (req, res) => {
  try {
    const data = await businessService.login(req.body.username, req.body.password);
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
  }
};

exports.getNearbyBusinesses = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    if (!latitude || !longitude)
      return res.status(400).json({ message: "Latitude and longitude are required" });

    const businesses = await businessService.getNearby(latitude, longitude);
    res.status(200).json({ success: true, count: businesses.length, businesses });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getBusinessDetails = async (req, res) => {
  try {
    const business = await businessService.getById(req.params.businessId);
    res.status(200).json({ success: true, business });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

// AUTHENTICATED BUSINESS
exports.getMyBusiness = async (req, res) => {
  try {
    const business = await businessService.getById(req.business.id);
    res.json({ success: true, business });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const business = await businessService.createProfile(req.business.id, req.body);
    res.status(200).json({ success: true, business });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const business = await businessService.updateProfile(req.business.id, req.body);
    res.status(200).json({ success: true, business });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    await businessService.uploadDocuments(req.business.id, req.files);
    res.json({ success: true, message: "Documents uploaded" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// ADMIN
exports.approveBusiness = async (req, res) => {
  try {
    await businessService.approve(req.params.businessId);
    res.json({ success: true, message: "Business approved" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.rejectBusiness = async (req, res) => {
  try {
    await businessService.reject(req.params.businessId, req.body.reason);
    res.json({ success: true, message: "Business rejected" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.getApprovedBusinesses = async (req, res) => {
  try {
    const businesses = await businessService.getApprovedBusinesses();
    res.json({ success: true, businesses });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    await businessService.deleteBusiness(req.params.businessId);
    res.json({ success: true, message: "Business deleted successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
