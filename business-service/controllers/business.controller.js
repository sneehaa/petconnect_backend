const businessService = require("../services/business.service");

exports.registerBusiness = async (req, res) => {
  try {
    // Prepare data with profile image if uploaded
    const registrationData = {
      ...req.body,
      profileImageFile: req.file // Pass the file object to service
    };
    
    const { business, tempToken } = await businessService.register(registrationData);

    res.status(201).json({
      success: true,
      message: "Business Registered Successfully",
      business,
      tempToken,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.loginBusiness = async (req, res) => {
  try {
    const data = await businessService.login(req.body.email, req.body.password);
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
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
    const files = req.file ? [req.file] : [];
    await businessService.uploadDocuments(req.business.id, files);
    res.json({ success: true, message: "Documents uploaded successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      throw new Error("Profile image is required");
    }

    const business = await businessService.uploadProfileImage(
      req.business.id,
      req.file
    );

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      business,
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

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

exports.approveAdoption = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const result = await businessService.approveAdoption(req.business.id, applicationId);

    res.status(200).json({
      success: true,
      message: "Adoption approved successfully",
      application: result
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.rejectAdoption = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason } = req.body;

    const result = await businessService.rejectAdoption(req.business.id, applicationId, reason);

    res.status(200).json({
      success: true,
      message: "Adoption rejected successfully",
      application: result
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Old password and new password are required" });
    }

    // Call service to reset password
    await businessService.resetPassword(req.business.id, oldPassword, newPassword);

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
// =======================
// COUNT BUSINESSES
// =======================
exports.getBusinessCount = async (req, res) => {
  try {
    const totalBusinesses = await businessService.getBusinessCount();
    res.status(200).json({
      success: true,
      stats: {
        totalBusinesses,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

