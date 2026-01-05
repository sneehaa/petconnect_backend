const businessService = require("./business.service");

// Register
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

// Approve
exports.approveBusiness = async (req, res) => {
  try {
    await businessService.approve(req.params.businessId);
    res.json({ success: true, message: "Business approved" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Reject
exports.rejectBusiness = async (req, res) => {
  try {
    await businessService.reject(req.params.businessId, req.body.reason);
    res.json({ success: true, message: "Business rejected" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Get business by user
exports.getMyBusiness = async (req, res) => {
  try {
    const business = await businessService.getByUser(req.user._id);
    res.json({ success: true, business });
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
