// controllers/user.controller.js
const axios = require("axios");
const logger = require("../utils/logger");
const response = require("../utils/response");

// ----------------------------
// Register a new user
// ----------------------------
exports.registerUser = async (req, res) => {
  try {
    const user = await User.create(req.body);

    // Notify Admin service to update dashboard stats
    axios.post("http://localhost:5510/api/admin/dashboard/events", {
      type: "USER_REGISTERED",
      payload: {
        userId: user._id,
        name: user.name,
        isActive: user.isActive ?? true
      }
    }).catch(err => logger.error("Failed to notify Admin-Service:", err));

    return response.success(res, { user }, "User registered successfully");
  } catch (err) {
    logger.error("User registration error:", err);
    return response.error(res, "Failed to register user", 500);
  }
};

// ----------------------------
// Get all users (admin only)
// ----------------------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude sensitive info
    const totalUsers = await User.countDocuments();
    return response.success(res, { totalUsers, users }, "Users fetched successfully");
  } catch (err) {
    logger.error("Get all users error:", err);
    return response.error(res, "Failed to fetch users", 500);
  }
};
