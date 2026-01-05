const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const businessRepo = require("./business.repository");
const Pet = require("../models/petModel");

class BusinessService {
  // Register a new business
  async register(data) {
    const exists = await businessRepo.findByUsername(data.username);
    if (exists) throw new Error("Business username already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return businessRepo.create({
      ...data,
      password: hashedPassword,
      businessStatus: "PENDING",
    });
  }

  // Login business and return JWT
  async login(username, password) {
    const business = await businessRepo.findByUsername(username);
    if (!business) throw new Error("Business not found");

    if (business.businessStatus === "PENDING") throw new Error("Business not approved yet");
    if (business.businessStatus === "REJECTED") throw new Error("Business registration rejected");

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

  // Upload business documents
  async uploadDocuments(businessId, files) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");
    if (business.businessStatus !== "PENDING") throw new Error("Cannot upload documents after review");

    business.documents.push(...files.map(f => f.path));
    await businessRepo.update(business);
  }

  // Admin approves business
  async approve(businessId) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");
    if (business.businessStatus !== "PENDING") throw new Error("Business already reviewed");

    business.businessStatus = "APPROVED";
    await businessRepo.update(business);
  }

  // Admin rejects business
  async reject(businessId, reason) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    business.businessStatus = "REJECTED";
    business.rejectionReason = reason;
    await businessRepo.update(business);
  }

  // Get business by logged-in user
  async getByUser(userId) {
    return businessRepo.findByUser(userId);
  }

  // Get all approved businesses
  async getApprovedBusinesses() {
    return businessRepo.findApproved();
  }


  // Create / Update business profile (address, geo, adoptionPolicy)
  async createProfile(businessId, data) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    Object.assign(business, {
      name: data.name,
      businessName: data.businessName,
      address: data.address,
      phoneNumber: data.phoneNumber,
      adoptionPolicy: data.adoptionPolicy,
      location: { type: "Point", coordinates: [Number(data.longitude), Number(data.latitude)] },
    });

    await businessRepo.update(business);
    return business;
  }

  async updateProfile(businessId, data) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    // Merge updates
    if (data.longitude !== undefined && data.latitude !== undefined) {
      data.location = { type: "Point", coordinates: [Number(data.longitude), Number(data.latitude)] };
      delete data.longitude;
      delete data.latitude;
    }

    Object.assign(business, data);
    await businessRepo.update(business);
    return business;
  }

  async deleteBusiness(businessId) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    // Delete all pets associated
    await Pet.deleteMany({ shelter: business._id });

    await businessRepo.delete(businessId);
  }

  // Get nearby businesses (formerly shelters)
  async getNearby(latitude, longitude) {
    return businessRepo.findNearby(latitude, longitude);
  }

  // Get business details with pets
  async getDetails(businessId) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    const pets = await Pet.find({ shelter: business._id });
    return { business, pets };
  }
}

module.exports = new BusinessService();
