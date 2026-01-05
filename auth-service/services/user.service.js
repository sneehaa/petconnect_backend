const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRepo = require("../repositories/user.repository");
const otpRepo = require("../repositories/otp.repository");
const { generateOTP } = require("../utils/otp.util");
const { sendMail } = require("../utils/mailer.util");

class UserService {
  async sendOTP(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = generateOTP();
    await otpRepo.create({ userId: user._id, email, otp, isUsed: false });

    await sendMail(email, "OTP Verification", `Your OTP is: ${otp}`);
  }

  async resendOTP(email) {
    const record = await otpRepo.findByEmail(email);
    if (!record) throw new Error("OTP not found");

    record.otp = generateOTP();
    record.isUsed = false;
    await record.save();

    await sendMail(email, "OTP Verification", `Your OTP is: ${record.otp}`);
  }

  async verifyOTP(otp) {
    const record = await otpRepo.findValidOtp(otp);
    if (!record) throw new Error("Invalid or expired OTP");

    record.isUsed = true;
    await record.save();
  }

  async updatePassword(otp, newPassword) {
    const record = await otpRepo.findUsedOtp(otp);
    if (!record) throw new Error("Invalid OTP");

    const user = await userRepo.findById(record.userId);
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await otpRepo.deleteById(record._id);
  }

  async register(data) {
    const exists = await userRepo.findByEmail(data.email);
    if (exists) throw new Error("Email already exists");

    data.password = await bcrypt.hash(data.password, 10);
    return userRepo.create(data);
  }

  async login(username, password) {
    const user = await userRepo.findByUsername(username);
    if (!user) throw new Error("User not found");

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...safeUser } = user.toObject();
    return { token, user: safeUser };
  }

  getAllUsers(page, limit) {
    const skip = (page - 1) * limit;
    return userRepo.getAll(skip, limit);
  }

  getProfile(id) {
    return userRepo.findById(id).select("-password");
  }

  updateProfile(id, data) {
    return userRepo.updateById(id, data);
  }

  deleteUser(id) {
    return userRepo.deleteById(id);
  }
}

module.exports = new UserService();
