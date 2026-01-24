const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const businessRepo = require("../repositories/business.repository");
const otpRepo = require("../repositories/otp.repository");
const rabbitmq = require("../utils/rabbitMQ");
const { generateOTP } = require("../utils/otp.util");
const { sendMail } = require("../utils/mailer.util");
const redisClient = require("../utils/redis.client");

const BUSINESS_EXCHANGE = process.env.BUSINESS_EXCHANGE;
const ADOPTION_EXCHANGE = process.env.ADOPTION_EXCHANGE;

class BusinessService {
  async sendOTP(email) {
    const business = await businessRepo.findByEmail(email);
    if (!business) throw new Error("Business not found");

    const otp = generateOTP();
    await otpRepo.deleteByEmail(email);
    await otpRepo.create({ userId: business._id, email, otp, isUsed: false });
    await redisClient.setEx(`otp:${email}`, 600, otp.toString());

    await sendMail(email, "Your Verification Code", otp);
  }

  async verifyEmail(email, otp) {
    const cachedOtp = await redisClient.get(`otp:${email}`);
    if (!cachedOtp || cachedOtp !== otp.toString()) {
      throw new Error("Invalid or expired OTP");
    }

    const business = await businessRepo.findByEmail(email);
    if (!business) throw new Error("Business not found");

    business.isEmailVerified = true;
    business.businessStatus = "Pending";
    await business.save();

    await redisClient.del(`otp:${email}`);
    await otpRepo.deleteByEmail(email);

    return {
      message: "Email verified. Your account is now pending admin approval.",
    };
  }

  async register(data) {
    const emailExists = await businessRepo.findByEmail(data.email);
    if (emailExists) throw new Error("Email already exists");

    data.password = await bcrypt.hash(data.password, 10);
    data.businessStatus = "Unverified";
    data.isEmailVerified = false;
    data.role = "BUSINESS";

    if (data.profileImageFile) {
      const result = await cloudinary.uploader.upload(
        data.profileImageFile.path,
        {
          folder: "business-profiles",
        },
      );
      data.profileImage = result.secure_url;
      fs.unlinkSync(data.profileImageFile.path);
    }

    const business = await businessRepo.create(data);
    await this.sendOTP(data.email);

    const tempToken = jwt.sign(
      { id: business._id, email: business.email, type: "TEMP" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return { business, tempToken };
  }

  async uploadDocs(businessId, file) {
    if (!file) throw new Error("No file uploaded");

    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "business-docs",
        resource_type: "auto",
      });

      const updated = await businessRepo.update(businessId, {
        $push: { documents: result.secure_url },
      });

      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return updated;
    } catch (err) {
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw new Error("Cloudinary Upload Failed: " + err.message);
    }
  }

  async updateProfileImage(businessId, file) {
    if (!file) throw new Error("No image file provided");
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "business-profile",
    });
    await businessRepo.update(businessId, { profileImage: result.secure_url });
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    return result.secure_url;
  }

  async createProfile(businessId, data) {
    return await businessRepo.update(businessId, {
      ...data,
      profileCompleted: true,
    });
  }

  async updateProfile(businessId, data) {
    return await businessRepo.update(businessId, data);
  }

  async login(email, password) {
    const business = await businessRepo.findByEmailRaw(email);
    if (!business || !(await bcrypt.compare(password, business.password))) {
      throw new Error("Invalid credentials");
    }
    if (!business.isEmailVerified) throw new Error("Please verify email first");
    if (business.businessStatus !== "Approved")
      throw new Error("Admin approval pending");

    const token = jwt.sign(
      { id: business._id, role: business.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );
    const { password: _, ...safeBusiness } = business.toObject();
    return { token, business: safeBusiness };
  }

  async approve(businessId) {
    const updated = await businessRepo.update(businessId, {
      businessStatus: "Approved",
    });
    await rabbitmq.publish(BUSINESS_EXCHANGE, "business.approved", {
      businessId: updated._id,
      email: updated.email,
    });
    return updated;
  }

  async getById(id) {
    return await businessRepo.findById(id);
  }

  async delete(id) {
    return await businessRepo.deleteById(id);
  }
}

module.exports = new BusinessService();
