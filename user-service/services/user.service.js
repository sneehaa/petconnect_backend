const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRepo = require("../repositories/user.repository");
const otpRepo = require("../repositories/otp.repository");
const { generateOTP } = require("../utils/otp.util");
const { sendMail } = require("../utils/mailer.util");
const redisClient = require("../utils/redis.client"); // ← Redis client import

class UserService {
  // ====================== SEND OTP ======================
  async sendOTP(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = generateOTP();

    // Save OTP in database
    await otpRepo.create({ userId: user._id, email, otp, isUsed: false });

    // Save OTP in Redis for 10 minutes
    await redisClient.setEx(`otp:${email}`, 600, otp);

    await sendMail(email, "OTP Verification", `Your OTP is: ${otp}`);
  }

  // ====================== RESEND OTP ======================
  async resendOTP(email) {
    const record = await otpRepo.findByEmail(email);
    if (!record) throw new Error("OTP not found");

    const otp = generateOTP();
    record.otp = otp;
    record.isUsed = false;
    await record.save();

    // Update Redis
    await redisClient.setEx(`otp:${email}`, 600, otp);

    await sendMail(email, "OTP Verification", `Your OTP is: ${otp}`);
  }

  // ====================== VERIFY OTP ======================
  async verifyOTP(email, otp) {
    // Check Redis first
    const cachedOtp = await redisClient.get(`otp:${email}`);
    if (!cachedOtp || cachedOtp !== otp) {
      throw new Error("Invalid or expired OTP");
    }

    // Mark OTP as used in DB
    const record = await otpRepo.findValidOtp(otp);
    if (record) {
      record.isUsed = true;
      await record.save();
    }

    // Delete OTP from Redis
    await redisClient.del(`otp:${email}`);
  }

  // ====================== UPDATE PASSWORD ======================
  async updatePassword(otp, newPassword) {
    const record = await otpRepo.findUsedOtp(otp);
    if (!record) throw new Error("Invalid OTP");

    const user = await userRepo.findById(record.userId);
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    await otpRepo.deleteById(record._id);
  }

  // ====================== REGISTER ======================
  async register(data) {
    const exists = await userRepo.findByEmail(data.email);
    if (exists) throw new Error("Email already exists");

    data.password = await bcrypt.hash(data.password, 10);
    data.role = data.isAdmin ? "Admin" : "User";

    return userRepo.create(data);
  }

  // ====================== LOGIN ======================
  async login(email, password) {
    const user = await userRepo.findByEmail(email);
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
