const businessService = require("../services/business.service");

exports.registerBusiness = async (req, res) => {
  try {
    const data = { ...req.body, profileImageFile: req.file };
    const result = await businessService.register(data);
    res.status(201).json({
      success: true,
      message:
        "Business registered. Please verify your email using the OTP sent.",
      ...result,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.verifyBusinessEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const result = await businessService.verifyEmail(email, otp);
    res.json({ success: true, message: result.message });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.loginBusiness = async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await businessService.login(email, password);
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
  }
};

// --- Missing functions added below to stop the crash ---

exports.sendOTP = async (req, res) => {
  try {
    await businessService.sendOTP(req.body.email);
    res.json({ success: true, message: "OTP sent" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const profile = await businessService.createProfile(
      req.business.id,
      req.body,
    );
    res.json({ success: true, profile });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const profile = await businessService.updateProfile(
      req.business.id,
      req.body,
    );
    res.json({ success: true, profile });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    const imageUrl = await businessService.updateProfileImage(
      req.business.id,
      req.file,
    );
    res.json({ success: true, imageUrl });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.uploadDocuments = async (req, res) => {
  try {
    // Handle tempAuthGuard (req.user) vs authGuardBusiness (req.business)
    const id = req.business ? req.business.id : req.user.id;
    const result = await businessService.uploadDocs(id, req.file);
    res.json({ success: true, result });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.getApprovedBusinesses = async (req, res) => {
  try {
    const businesses = await businessService.getApproved();
    res.json({ success: true, businesses });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getBusinessDetails = async (req, res) => {
  try {
    const business = await businessService.getById(req.params.businessId);
    res.json({ success: true, business });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    await businessService.delete(req.params.businessId);
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// --- End of missing functions ---

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

exports.approveAdoption = async (req, res) => {
  try {
    const result = await businessService.approveAdoption(
      req.business.id,
      req.params.applicationId,
    );
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.rejectAdoption = async (req, res) => {
  try {
    const result = await businessService.rejectAdoption(
      req.business.id,
      req.params.applicationId,
      req.body.reason,
    );
    res.json({ success: true, ...result });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    await businessService.resetPassword(
      req.business.id,
      req.body.oldPassword,
      req.body.newPassword,
    );
    res.json({ success: true, message: "Password reset successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.getBusinessCount = async (req, res) => {
  try {
    const count = await businessService.getBusinessCount();
    res.json({ success: true, count });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getMyBusiness = async (req, res) => {
  try {
    const business = await businessService.getById(req.business.id);
    res.json({ success: true, business });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};
