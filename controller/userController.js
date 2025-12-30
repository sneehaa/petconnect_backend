const Users = require("../model/userModel");
const OTP = require("../model/otpModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const otp = generateOTP();

    await OTP.create({
      userId: user._id,
      email,
      otp,
      isUsed: false,
    });

    await transporter.sendMail({
      from: '"App Support" <no-reply@app.com>',
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(404).json({ success: false, message: "OTP not found." });
    }

    const otp = generateOTP();

    otpRecord.otp = otp;
    otpRecord.isUsed = false;
    await otpRecord.save();

    await transporter.sendMail({
      from: '"App Support" <no-reply@app.com>',
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ success: true, message: "OTP resent successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to resend OTP." });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;

    const otpRecord = await OTP.findOne({ otp, isUsed: false });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }

    otpRecord.isUsed = true;
    await otpRecord.save();

    res.status(200).json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "OTP verification failed." });
  }
};

// Update Password using OTP
const updatePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    const otpRecord = await OTP.findOne({ otp, isUsed: true });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    const user = await Users.findById(otpRecord.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update password." });
  }
};

// Register
const register = async (req, res) => {
  try {
    const { fullName, username, email, phoneNumber, password, confirmPassword, role } = req.body;

    if (!fullName || !username || !email || !phoneNumber || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match." });
    }

    const exists = await Users.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Users.create({
      fullName,
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      role: role || "user",
    });

    res.status(201).json({ success: true, message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed." });
  }
};

// Login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await Users.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isMatched = await bcrypt.compare(password, user.password);
    if (!isMatched) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...safeUser } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      userData: safeUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed." });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await Users.find()
      .select("-password")
      .skip(skip)
      .limit(limit);

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await Users.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile." });
  }
};

const editUserProfile = async (req, res) => {
  try {
    const updatedUser = await Users.findByIdAndUpdate(
      req.params.userId,
      req.body,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed." });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const deleted = await Users.findByIdAndDelete(req.params.userId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed." });
  }
};


module.exports = {
  sendOTP,
  resendOTP,
  verifyOTP,
  updatePassword,
  register,
  loginUser,
  getAllUsers,
  getUserProfile,
  editUserProfile,
  deleteUserAccount,
};
