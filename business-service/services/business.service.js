<<<<<<< HEAD
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
=======
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const businessRepo = require("../repositories/business.repository");

class BusinessService {
  async register(data) {
    // Check if email already exists
    const emailExists = await businessRepo.findByEmail(data.email);
    if (emailExists) throw new Error("Email already exists");

    // Check if username already exists
    const usernameExists = await businessRepo.findByUsername(data.username);
    if (usernameExists) throw new Error("Username already exists");

    // Hash password
    data.password = await bcrypt.hash(data.password, 10);
    data.businessStatus = "Pending";
    data.role = "BUSINESS";
    
    // Handle profile image upload to Cloudinary
    if (data.profileImageFile) {
      try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(data.profileImageFile.path, {
          folder: 'business-profiles',
          public_id: `business-profile-${Date.now()}`,
          resource_type: 'image'
        });
        
        // Set Cloudinary URL
        data.profileImage = result.secure_url;
        
        // Delete the temporary file
        fs.unlinkSync(data.profileImageFile.path);
      } catch (uploadError) {
        // Clean up file if upload fails
        if (data.profileImageFile && data.profileImageFile.path && fs.existsSync(data.profileImageFile.path)) {
          fs.unlinkSync(data.profileImageFile.path);
        }
        throw new Error("Failed to upload profile image: " + uploadError.message);
      }
    }
    
    // Remove the file object from data before saving to database
    delete data.profileImageFile;

    const business = await businessRepo.create(data);

    // FIX: Add type: "TEMP" to the token payload
    const tempToken = jwt.sign(
      { 
        id: business._id, 
        email: business.email,
        type: "TEMP"  // ← ADD THIS LINE
      },
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
>>>>>>> 4fef8b60fd1a565ebb5ad287c89035cd1fd56a01
    }

    // Regular login token doesn't need type
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

  async createProfile(businessId, data) {
    return businessRepo.update(businessId, data);
  }

  async updateProfile(businessId, data) {
    return businessRepo.update(businessId, data);
  }

  async uploadDocuments(businessId, files) {
    const documentUrls = [];
    
    // Upload each document to Cloudinary
    for (const file of files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'business-documents',
          resource_type: 'auto' // Auto-detect file type
        });
        documentUrls.push(result.secure_url);
        
        // Delete the temporary file
        fs.unlinkSync(file.path);
      } catch (uploadError) {
        // Clean up file if upload fails
        if (file && file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        throw new Error("Failed to upload document: " + uploadError.message);
      }
    }
    
    return businessRepo.update(businessId, {
      $push: { documents: { $each: documentUrls } },
    });
  }

  async uploadProfileImage(businessId, file) {
    let cloudinaryResult;
    
    try {
      // Upload new image to Cloudinary
      cloudinaryResult = await cloudinary.uploader.upload(file.path, {
        folder: 'business-profiles',
        public_id: `business-${businessId}-profile-${Date.now()}`,
        resource_type: 'image'
      });
      
      // Delete the temporary file
      fs.unlinkSync(file.path);
    } catch (uploadError) {
      // Clean up file if upload fails
      if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw new Error("Failed to upload profile image: " + uploadError.message);
    }
    
    return businessRepo.update(businessId, {
      profileImage: cloudinaryResult.secure_url,
    });
  }

  async approve(businessId) {
    const business = await businessRepo.findById(businessId);

    if (!business) throw new Error("Business not found");

    if (!business.documents || business.documents.length === 0) {
      throw new Error(
        "Business must upload verification documents before approval"
      );
    }

    return businessRepo.update(businessId, {
      businessStatus: "Approved",
      rejectionReason: null,
    });
  }

  async reject(businessId, reason) {
    return businessRepo.update(businessId, {
      businessStatus: "Rejected",
      rejectionReason: reason,
    });
  }

  async getApprovedBusinesses() {
    return businessRepo.findApproved();
  }

  async deleteBusiness(businessId) {
    const business = await businessRepo.findById(businessId);
    if (business) {
      if (business.profileImage) {
        const publicId = business.profileImage.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`business-profiles/${publicId}`);
      }
  
      if (business.documents && business.documents.length > 0) {
        for (const docUrl of business.documents) {
          const publicId = docUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`business-documents/${publicId}`, {
            resource_type: 'raw'
          });
        }
      }
    }
    
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
<<<<<<< HEAD
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
=======
    const response = await axios.put(
      `${process.env.DASHBOARD_URL}/api/adoption-applications/reject/${applicationId}`,
      { reason },
      { headers: { "x-business-id": businessId } }
    );
    return response.data;
  }
}

module.exports = new BusinessService();
>>>>>>> 4fef8b60fd1a565ebb5ad287c89035cd1fd56a01
