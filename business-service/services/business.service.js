const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const businessRepo = require("../repositories/business.repository");

class BusinessService {
  async register(data) {
    const exists = await businessRepo.findByUsername(data.username);
    if (exists) throw new Error("Business username already exists");

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const business = await businessRepo.create({
      ...data,
      password: hashedPassword,
      role: "BUSINESS",
      businessStatus: "Pending",
    });

    const tempToken = jwt.sign(
      { id: business._id, type: "TEMP" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    return { business, tempToken };
  }

  async login(email, password) {
    const business = await businessRepo.findByUsername(email);

    if (!business) throw new Error("Business not found");
    const matched = await bcrypt.compare(password, business.password);
    if (!matched) throw new Error("Invalid credentials");
    
    if (business.businessStatus === "Pending") {
      if (!business.documents || business.documents.length === 0) {
        throw new Error(
          "Please upload your verification documents to complete registration"
        );
      } else {
        throw new Error(
          "Your business registration is pending admin approval. Please wait for verification."
        );
      }
    }
    if (business.businessStatus === "Rejected") {
      const reason = business.rejectionReason || "No reason provided";
      throw new Error(`Business registration rejected. Reason: ${reason}`);
    }
    if (business.businessStatus !== "Approved") {
      throw new Error("Business account is not active");
    }

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

    if (business.businessStatus === "Approved") {
      throw new Error("Business already approved. Cannot upload documents.");
    }

    if (business.businessStatus === "Rejected") {
      throw new Error(
        "Business registration rejected. Please contact support."
      );
    }

    if (!files || files.length === 0) {
      throw new Error("No files provided");
    }

    // Each file has a path, Multer provides `file.path`
    const filePaths = files.map((f) => f.path);

    // Replace existing documents or add new ones
    business.documents = [...(business.documents || []), ...filePaths];

    await businessRepo.update(business);

    return {
      message:
        "Documents uploaded successfully. Your business is now pending admin approval.",
      documentsCount: business.documents.length,
    };
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
