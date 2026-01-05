const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const businessRepo = require("./business.repository");

class BusinessService {
  // Register a new business
  async register(data) {
    const exists = await businessRepo.findByUsername(data.username);
    if (exists) throw new Error("Business username already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    return businessRepo.create({
      ...data,
      password: hashedPassword,
      status: "PENDING",
    });
  }

  // Login business and return JWT
  async login(username, password) {
    const business = await businessRepo.findByUsername(username);
    if (!business) throw new Error("Business not found");

    if (business.status === "PENDING") throw new Error("Business not approved yet");
    if (business.status === "REJECTED") throw new Error("Business registration rejected");

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
    if (business.status !== "PENDING") throw new Error("Cannot upload documents after review");

    business.documents.push(...files.map((f) => f.path));
    await businessRepo.update(business);
  }

  // Admin approves business
  async approve(businessId) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");
    if (business.status !== "PENDING") throw new Error("Business already reviewed");

    business.status = "APPROVED";
    await businessRepo.update(business);
  }

  // Admin rejects business
  async reject(businessId, reason) {
    const business = await businessRepo.findById(businessId);
    if (!business) throw new Error("Business not found");

    business.status = "REJECTED";
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
}

module.exports = new BusinessService();
