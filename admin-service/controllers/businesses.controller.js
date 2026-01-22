const Business = require("../database/models/Business");
const logger = require("../utils/logger");
const response = require("../utils/response");

// ----------------------------
// Get all businesses / shelters
// ----------------------------
exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().populate("owner", "name email"); // optional: show owner info
    return response.success(res, { businesses });
  } catch (err) {
    logger.error("Get all businesses error:", err);
    return response.error(res, "Failed to fetch businesses", 500);
  }
};

// ----------------------------
// Approve business
// ----------------------------
exports.approveBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findByIdAndUpdate(
      businessId,
      { status: "approved" },
      { new: true }
    );

    if (!business) return response.error(res, "Business not found", 404);

    return response.success(res, { business, message: "Business approved successfully" });
  } catch (err) {
    logger.error("Approve business error:", err);
    return response.error(res, "Failed to approve business", 500);
  }
};

// ----------------------------
// Reject business
// ----------------------------
exports.rejectBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findByIdAndUpdate(
      businessId,
      { status: "rejected" },
      { new: true }
    );

    if (!business) return response.error(res, "Business not found", 404);

    return response.success(res, { business, message: "Business rejected successfully" });
  } catch (err) {
    logger.error("Reject business error:", err);
    return response.error(res, "Failed to reject business", 500);
  }
};

// ----------------------------
// Verify documents
// ----------------------------
exports.verifyDocuments = async (req, res) => {
  try {
    const { businessId } = req.params;
    const business = await Business.findByIdAndUpdate(
      businessId,
      { documentsVerified: true },
      { new: true }
    );

    if (!business) return response.error(res, "Business not found", 404);

    return response.success(res, { business, message: "Business documents verified" });
  } catch (err) {
    logger.error("Verify documents error:", err);
    return response.error(res, "Failed to verify documents", 500);
  }
};

// ----------------------------
// Update shelter/business details
// ----------------------------
exports.updateBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;
    const updates = req.body; // e.g., { name, address, contact }

    const business = await Business.findByIdAndUpdate(businessId, updates, { new: true });

    if (!business) return response.error(res, "Business not found", 404);

    return response.success(res, { business, message: "Business updated successfully" });
  } catch (err) {
    logger.error("Update business error:", err);
    return response.error(res, "Failed to update business", 500);
  }
};

// ----------------------------
// Soft-delete a shelter/business
// ----------------------------
exports.removeBusiness = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findByIdAndUpdate(
      businessId,
      { isActive: false, removedAt: new Date(), removedBy: req.user?.id || null },
      { new: true }
    );

    if (!business) return response.error(res, "Business not found", 404);

    return response.success(res, { business, message: "Business removed successfully" });
  } catch (err) {
    logger.error("Remove business error:", err);
    return response.error(res, "Failed to remove business", 500);
  }
};
