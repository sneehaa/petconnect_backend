const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const businessRepo = require("../repositories/business.repository");
const { sendMail } = require("../utils/mailer.util");

class BusinessService {
  async register(data) {
    const exists = await businessRepo.findByEmail(data.email);
    if (exists) throw new Error("Email already exists");

    data.password = await bcrypt.hash(data.password, 10);
    data.businessStatus = "Pending";
    data.role = "BUSINESS";

    const business = await businessRepo.create(data);
    
    const tempToken = jwt.sign(
      { id: business._id, email: business.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return { business, tempToken };
  }

  async login(email, password) {
    const business = await businessRepo.findByEmail(email);
    if (!business) throw new Error("Business not found");

    const valid = await bcrypt.compare(password, business.password);
    if (!valid) throw new Error("Invalid credentials");

    if (business.businessStatus !== "Approved") {
      throw new Error("Business not approved yet");
    }

    const token = jwt.sign(
      { id: business._id, role: business.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { password: _, ...safeBusiness } = business.toObject();
    return { token, business: safeBusiness };
  }

  async getById(id) {
    const business = await businessRepo.findById(id);
    if (!business) throw new Error("Business not found");
    return business;
  }

  async getNearby(latitude, longitude) {
    return businessRepo.findNearby(latitude, longitude);
  }

  async createProfile(businessId, data) {
    return businessRepo.update(businessId, data);
  }

  async updateProfile(businessId, data) {
    return businessRepo.update(businessId, data);
  }

  async uploadDocuments(businessId, files) {
    const documentUrls = files.map(file => file.path || file.url);
    return businessRepo.update(businessId, { 
      $push: { documents: { $each: documentUrls } } 
    });
  }

  async approve(businessId) {
    return businessRepo.update(businessId, { 
      businessStatus: "Approved",
      rejectionReason: null 
    });
  }

  async reject(businessId, reason) {
    return businessRepo.update(businessId, { 
      businessStatus: "Rejected",
      rejectionReason: reason 
    });
  }

  async getApprovedBusinesses() {
    return businessRepo.findApproved();
  }

  async deleteBusiness(businessId) {
    return businessRepo.delete(businessId);
  }

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
}

module.exports = new BusinessService();