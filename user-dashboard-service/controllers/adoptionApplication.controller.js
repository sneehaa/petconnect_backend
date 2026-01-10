const AdoptionApplication = require('../models/AdoptionApplication');

// Create a new adoption application
exports.createAdoptionApplication = async (req, res) => {
  try {
    const app = await AdoptionApplication.create(req.body);
    res.status(201).json({ success: true, application: app });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Get all applications for a user
exports.getMyApplications = async (req, res) => {
  try {
    const apps = await AdoptionApplication.find({ userId: req.params.userId });
    res.json({ success: true, applications: apps });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Approve adoption (business)
exports.approveAdoption = async (req, res) => {
  try {
    const application = await AdoptionApplication.findById(req.params.applicationId);
    if (!application) throw new Error("Application not found");

    application.status = "approved";
    await application.save();

    res.json({ success: true, application });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// Reject adoption (business)
exports.rejectAdoption = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) throw new Error("Rejection reason is required");

    const application = await AdoptionApplication.findById(req.params.applicationId);
    if (!application) throw new Error("Application not found");

    if (application.status !== "pending") {
      throw new Error(`Application already ${application.status}`);
    }

    application.status = "rejected";
    application.rejectionReason = reason;
    await application.save();

    res.json({ success: true, application });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};
