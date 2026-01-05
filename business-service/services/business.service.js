const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const businessRepo = require("../repositories/business.repository");

class BusinessService {
  async register(data) {
    const exists = await businessRepo.findByUsername(data.username);
    if (exists) throw new Error("Business username already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return businessRepo.create({
      ...data,
      password: hashedPassword,
      businessStatus: "Pending",
    });
  }

  async login(username, password) {
    const business = await businessRepo.findByUsername(username);
    if (!business) throw new Error("Business not found");

    if (business.businessStatus === "Pending")
      throw new Error("Business not approved yet");
    if (business.businessStatus === "Rejected")
      throw new Error("Business registration rejected");

    const matched = await bcrypt.compare(password, business.password);
    if (!matched) throw new Error("Invalid credentials");

    const token = jwt.sign(
      { id: business._id, role: business.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...safeBusiness } = business.toObject();
    return { token, business: safeBusiness };
  }

  async getById(businessId) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");
    return business;
  }

  async uploadDocuments(businessId, files) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");
    if (business.businessStatus !== "Pending")
      throw new Error("Cannot upload documents after review");

    business.documents.push(...files.map((f) => f.path));
    await businessRepo.update(business);
  }

  async createProfile(businessId, data) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    Object.assign(business, {
      businessName: data.businessName,
      address: data.address,
      phoneNumber: data.phoneNumber,
      adoptionPolicy: data.adoptionPolicy,
      location: {
        type: "Point",
        coordinates: [Number(data.longitude), Number(data.latitude)],
      },
    });

    await businessRepo.update(business);
    return business;
  }

  async updateProfile(businessId, data) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    if (data.longitude !== undefined && data.latitude !== undefined) {
      data.location = {
        type: "Point",
        coordinates: [Number(data.longitude), Number(data.latitude)],
      };
      delete data.longitude;
      delete data.latitude;
    }

    Object.assign(business, data);
    await businessRepo.update(business);
    return business;
  }

  async approve(businessId) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");
    if (business.businessStatus !== "Pending")
      throw new Error("Business already reviewed");

    business.businessStatus = "Approved";
    await businessRepo.update(business);
  }

  async reject(businessId, reason) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    business.businessStatus = "Rejected";
    business.rejectionReason = reason;
    await businessRepo.update(business);
  }

  async deleteBusiness(businessId) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");
    await businessRepo.delete(businessId);
  }

  async getApprovedBusinesses() {
    return businessRepo.findApproved();
  }

  async getNearby(latitude, longitude) {
    return businessRepo.findNearby(latitude, longitude);
  }
}

module.exports = new BusinessService();
