const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const Business = require("../models/business.model"); // Mongoose model
const businessRepo = require("../repositories/business.repository");

class BusinessService {
  // -----------------------
  // AUTH & PROFILE
  // -----------------------
  async register(data) {
    const { username, businessName, phoneNumber, email, password } = data;
    if (!username || !businessName || !phoneNumber || !email || !password) {
      throw new Error("All fields are required");
    }

    const existing = await Business.findOne({ email });
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(password, 10);

    const business = await Business.create({
      username,
      businessName,
      phoneNumber,
      email,
      password: hashedPassword,
      status: "pending",
      role: "BUSINESS",
    });

    const tempToken = jwt.sign(
      { id: business._id, email: business.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { business, tempToken };
  }

  async login(email, password) {
    if (!email || !password) throw new Error("Email and password are required");

    const business = await Business.findOne({ email });
    if (!business) throw new Error("Invalid credentials");

    const valid = await bcrypt.compare(password, business.password);
    if (!valid) throw new Error("Invalid credentials");

    if (business.status !== "approved") throw new Error("Business not approved yet");

    const token = jwt.sign(
      { id: business._id, role: business.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...safeBusiness } = business.toObject();
    return { token, business: safeBusiness };
  }

  async getById(businessId) {
    const business = await Business.findById(businessId);
    if (!business) throw new Error("Business not found");
    return business;
  }

  async createProfile(businessId, data) {
    const business = await this.getById(businessId);
    Object.assign(business, data);
    await business.save();
    return business;
  }

  async updateProfile(businessId, data) {
    return this.createProfile(businessId, data);
  }

  async uploadDocuments(businessId, files) {
    const business = await this.getById(businessId);
    if (!business.documents) business.documents = [];
    files.forEach((file) => {
      business.documents.push({ filename: file.filename, path: file.path });
    });
    await business.save();
    return business;
  }

  async approve(businessId) {
    const business = await this.getById(businessId);
    business.status = "approved";
    business.rejectionReason = null;
    await business.save();
    return business;
  }

  async reject(businessId, reason) {
    const business = await this.getById(businessId);
    business.status = "rejected";
    business.rejectionReason = reason;
    await business.save();
    return business;
  }

  async getApprovedBusinesses() {
    return Business.find({ status: "approved" });
  }

  async deleteBusiness(businessId) {
    return Business.findByIdAndDelete(businessId);
  }

  // -----------------------
  // ADOPTION ACTIONS
  // -----------------------
  async approveAdoption(businessId, applicationId) {
    const response = await axios.put(
      `${process.env.DASHBOARD_URL}/api/adoption-applications/approve/${applicationId}`,
      {},
      { headers: { "x-business-id": businessId } }
    );
    return response.data;
  }

  async rejectAdoption(businessId, applicationId, reason) {
    const response = await axios.put(
      `${process.env.DASHBOARD_URL}/api/adoption-applications/reject/${applicationId}`,
      { reason },
      { headers: { "x-business-id": businessId } }
    );
    return response.data;
  }

  // -----------------------
  // PASSWORD RESET
  // -----------------------
  async resetPassword(businessId, oldPassword, newPassword) {
    const business = await Business.findById(businessId);
    if (!business) throw new Error("Business not found");

    const isMatch = await bcrypt.compare(oldPassword, business.password);
    if (!isMatch) throw new Error("Old password is incorrect");

    business.password = await bcrypt.hash(newPassword, 10);
    await business.save();

    return true;
  }
}

exports.getBusinessCount = async () => {
  return Business.countDocuments();
};

module.exports = new BusinessService();
