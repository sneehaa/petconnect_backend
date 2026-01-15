const axios = require("axios");
const userService = require("../services/user.service");

// ----------------------
// Send OTP
// ----------------------
exports.sendOTP = async (req, res) => {
  try {
    await userService.sendOTP(req.body.email);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// ----------------------
// Register User & Notify Admin-Service
// ----------------------
exports.register = async (req, res) => {
  try {
    const user = await userService.register(req.body); // create user

    // Send event to Admin-Service
    try {
      await axios.post("http://admin-service:5510/api/admin/dashboard/events", {
        type: "USER_REGISTERED",
        payload: {
          userId: user._id,
          name: user.name,
          isActive: user.isActive
        }
      });
    } catch (err) {
      console.error(
        "Failed to send USER_REGISTERED event to Admin-Service:",
        err.message
      );
    }

    res.status(201).json({ success: true, message: "Registered successfully", user });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// ----------------------
// Login User
// ----------------------
exports.loginUser = async (req, res) => {
  try {
    const data = await userService.login(req.body.email, req.body.password);
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
  }
};

// ----------------------
// Get User Profile
// ----------------------
exports.getUserProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.params.userId);
    res.json({ success: true, user });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

// ----------------------
// Get All Users
// ----------------------
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await userService.getAllUsers(+page, +limit);
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// ----------------------
// Edit User Profile
// ----------------------
exports.editUserProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(req.params.userId, req.body);
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

// ----------------------
// Delete User Account
// ----------------------
exports.deleteUserAccount = async (req, res) => {
  try {
    await userService.deleteUser(req.params.userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};
