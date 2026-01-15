const Business = require("../models/business.model"); // Mongoose model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");

class BusinessService {
  // -----------------------
  // AUTH & PROFILE
  // -----------------------
  async register(data) {
    const { username, businessName, phoneNumber, email, password } = data;

    if (!username || !businessName || !phoneNumber || !email || !password) {
      throw new Error(
        "All fields are required: username, businessName, phoneNumber, email, password"
      );
    }

    const existing = await Business.findOne({ email });
    if (existing) throw new Error("Email already in use");

    const hashedPassword = await bcrypt.hash(password, 10);

    const business = await Business.create({
      username,
      businessName,
      phoneNumber,
      email,
      password,
      status: "pending",
    });

    const tempToken = this._generateToken(business);
    return { business, tempToken };
  }

  async login(email, password) {
    if (!email || !password) throw new Error("Email and password are required");

    const business = await Business.findOne({ email });
    if (!business) throw new Error("Invalid credentials");

    const match = await bcrypt.compare(password, business.password);
    if (!match) throw new Error("Invalid credentials");

    const token = this._generateToken(business);
    return { business, token };
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

  async getNearby(latitude, longitude) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) throw new Error("Invalid coordinates");

    return Business.find({
      status: "approved",
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 5000,
        },
      },
    });
  }

  async approve(businessId) {
    const business = await this.getById(businessId);
    business.status = "approved";
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
    await Business.findByIdAndDelete(businessId);
  }

  // -----------------------
  // ADOPTION ACTIONS
  // -----------------------
  async approveAdoption(businessId, applicationId) {
    const ADOPTION_URL = process.env.ADOPTION_SERVICE_URL || "http://adoption-service:5503";

    try {
      const response = await axios.put(
        `${ADOPTION_URL}/business/adoptions/approve/${applicationId}`,
        {},
        { headers: { "x-business-id": businessId } }
      );
      return response.data;
    } catch (err) {
      if (err.response) throw new Error(err.response.data.message || "Adoption service error");
      else throw new Error(err.message || "Failed to call adoption service");
    }
  }

  async rejectAdoption(businessId, applicationId, reason) {
    const ADOPTION_URL = process.env.ADOPTION_SERVICE_URL || "http://adoption-service:5503";

    try {
      const response = await axios.put(
        `${ADOPTION_URL}/business/adoptions/reject/${applicationId}`,
        { reason },
        { headers: { "x-business-id": businessId } }
      );
      return response.data;
    } catch (err) {
      if (err.response) throw new Error(err.response.data.message || "Adoption service error");
      else throw new Error(err.message || "Failed to call adoption service");
    }
  }

  // -----------------------
  // PASSWORD RESET
  // -----------------------
  async resetPassword(businessId, oldPassword, newPassword) {
  const business = await Business.findById(businessId);
  if (!business) throw new Error("Business not found");

  const isMatch = await bcrypt.compare(oldPassword, business.password);
  if (!isMatch) throw new Error("Old password is incorrect");

  business.password = newPassword; // ✅ plain password
  await business.save();           // ✅ model hashes it

  return true;
}

  // -----------------------
  // HELPERS
  // -----------------------
  _generateToken(business) {
    return jwt.sign(
      { id: business._id, role: "BUSINESS" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  }

  async _checkPetExists(petId) {
    const PET_URL = process.env.PET_SERVICE_URL || "http://pet-service:5502";
    try {
      await axios.get(`${PET_URL}/pets/${petId}`);
    } catch (err) {
      throw new Error("Pet not found or pet-service unavailable");
    }
  }
}

exports.getBusinessCount = async () => {
  return await Business.countDocuments();
};


module.exports = new BusinessService();
console.log("bcrypt is defined?", !!bcrypt);
