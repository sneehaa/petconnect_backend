const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepo = require("../repositories/user.repository");
const otpRepo = require("../repositories/otp.repository");
const { generateOTP } = require("../utils/otp.util");
const { sendMail } = require("../utils/mailer.util");
const redisClient = require("../utils/redis.client");

class UserService {
  async sendOTP(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = generateOTP();

    await otpRepo.create({ userId: user._id, email, otp, isUsed: false });
    await redisClient.setEx(`otp:${email}`, 600, otp.toString());

    await sendMail(email, "Your Verification Code", otp);
  }

  async resendOTP(email) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const otp = generateOTP();

    await otpRepo.deleteByEmail(email);
    await otpRepo.create({ userId: user._id, email, otp, isUsed: false });
    await redisClient.setEx(`otp:${email}`, 600, otp.toString());

    await sendMail(email, "Your Verification Code", otp);
  }

  async verifyOTP(email, otp) {
    const cachedOtp = await redisClient.get(`otp:${email}`);

    if (!cachedOtp || cachedOtp !== otp.toString()) {
      throw new Error("Invalid or expired OTP");
    }

    await redisClient.del(`otp:${email}`);
    await otpRepo.deleteByEmail(email);

    return true;
  }

  async verifyRegistration(email, otp) {
    const cachedOtp = await redisClient.get(`otp:${email}`);
    if (!cachedOtp || cachedOtp !== otp.toString()) {
      throw new Error("Invalid or expired OTP");
    }

    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    user.isVerified = true;
    await user.save();

    await redisClient.del(`otp:${email}`);
    await otpRepo.deleteByEmail(email);

    return { message: "Account verified successfully" };
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

    const usernameExists = await userRepo.findByUsername(data.username);
    if (usernameExists) throw new Error("Username already taken");

    data.password = await bcrypt.hash(data.password, 10);
    data.role = data.isAdmin ? "Admin" : "User";
    data.isVerified = false;

    const newUser = await userRepo.create(data);

    try {
      await this.sendOTP(data.email);
    } catch (err) {
      console.error("Mail service error during registration");
    }

    return newUser;
  }

  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    if (!user.isVerified) {
      throw new Error("Please verify your email before logging in");
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    const { password: _, ...safeUser } = user.toObject();
    return { token, user: safeUser };
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

  getAllUsers(page = 1, limit = 10, filters = {}) {
    const skip = (page - 1) * limit;
    return userRepo.getAll(skip, limit, filters);
  }

  async getUserCount(filters = {}) {
    return userRepo.count(filters);
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepo.findById(userId);
    if (!user) throw new Error("User not found");

    const matched = await bcrypt.compare(oldPassword, user.password);
    if (!matched) throw new Error("Current password is incorrect");

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return { message: "Password changed successfully" };
  }
}

module.exports = new UserService();
