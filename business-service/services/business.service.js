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

    const usernameExists = await businessRepo.findByUsername(data.username);
    if (usernameExists) throw new Error("Username already exists");

    data.password = await bcrypt.hash(data.password, 10);
    data.businessStatus = "Unverified";
    data.isEmailVerified = false;
    data.role = "BUSINESS";

    if (data.profileImageFile) {
      try {
        const result = await cloudinary.uploader.upload(
          data.profileImageFile.path,
          {
            folder: "business-profiles",
            resource_type: "image",
          },
        );
        data.profileImage = result.secure_url;
        fs.unlinkSync(data.profileImageFile.path);
      } catch (uploadError) {
        if (
          data.profileImageFile?.path &&
          fs.existsSync(data.profileImageFile.path)
        ) {
          fs.unlinkSync(data.profileImageFile.path);
        }
        throw new Error("Failed to upload image: " + uploadError.message);
      }
    }

    delete data.profileImageFile;
    const business = await businessRepo.create(data);

    try {
      await this.sendOTP(data.email);
    } catch (err) {
      console.error("OTP send failed during business registration");
    }

    const tempToken = jwt.sign(
      { id: business._id, email: business.email, type: "TEMP" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return { business, tempToken };
  }

  async login(email, password) {
    const business = await businessRepo.findByEmailRaw(email);
    if (!business) throw new Error("Business not found");

    const valid = await bcrypt.compare(password, business.password);
    if (!valid) throw new Error("Invalid credentials");

    if (!business.isEmailVerified) {
      throw new Error("Please verify your email first");
    }

    if (business.businessStatus !== "Approved") {
      throw new Error("Business not approved yet by Admin");
    }

    const token = jwt.sign(
      { id: business._id, role: business.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    const { password: _, ...safeBusiness } = business.toObject();
    return { token, business: safeBusiness };
  }

  async approve(businessId) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    const updatedBusiness = await businessRepo.update(businessId, {
      businessStatus: "Approved",
      rejectionReason: null,
    });

    await rabbitmq.publish(BUSINESS_EXCHANGE, "business.approved", {
      businessId: updatedBusiness._id,
      email: updatedBusiness.email,
      name: updatedBusiness.businessName,
    });

    return updatedBusiness;
  }

  async reject(businessId, reason) {
    const updatedBusiness = await businessRepo.update(businessId, {
      businessStatus: "Rejected",
      rejectionReason: reason,
    });

    await rabbitmq.publish(BUSINESS_EXCHANGE, "business.rejected", {
      businessId: updatedBusiness._id,
      reason,
    });

    return updatedBusiness;
  }

  async approveAdoption(businessId, applicationId) {
    await rabbitmq.publish(ADOPTION_EXCHANGE, "adoption.approval.requested", {
      applicationId,
      businessId,
      status: "approved",
      timestamp: new Date(),
    });
    return { status: "processing" };
  }

  async rejectAdoption(businessId, applicationId, reason) {
    await rabbitmq.publish(ADOPTION_EXCHANGE, "adoption.rejection.requested", {
      applicationId,
      businessId,
      reason,
      status: "rejected",
      timestamp: new Date(),
    });
    return { status: "processing" };
  }

  async resetPassword(businessId, oldPassword, newPassword) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");
    const isMatch = await bcrypt.compare(oldPassword, business.password);
    if (!isMatch) throw new Error("Old password is incorrect");
    business.password = await bcrypt.hash(newPassword, 10);
    await business.save();
    return true;
  }

  async getBusinessCount() {
    return await businessRepo.findAll().countDocuments();
  }

  async getById(id) {
    return await businessRepo.findById(id);
  }
}

module.exports = new BusinessService();
