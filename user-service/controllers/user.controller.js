const userService = require("../services/user.service");

exports.sendOTP = async (req, res) => {
  try {
    await userService.sendOTP(req.body.email);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.register = async (req, res) => {
  try {
    await userService.register(req.body);
    res.status(201).json({ success: true, message: "Registered successfully" });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const data = await userService.login(
      req.body.email,
      req.body.password
    );
    res.json({ success: true, ...data });
  } catch (e) {
    res.status(401).json({ success: false, message: e.message });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.params.userId);
    res.json({ success: true, user });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await userService.getAllUsers(+page, +limit);
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.editUserProfile = async (req, res) => {
  try {
    const user = await userService.updateProfile(
      req.params.userId,
      req.body
    );
    res.json({ success: true, user });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
};

exports.deleteUserAccount = async (req, res) => {
  try {
    await userService.deleteUser(req.params.userId);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (e) {
    res.status(404).json({ success: false, message: e.message });
  }
};
