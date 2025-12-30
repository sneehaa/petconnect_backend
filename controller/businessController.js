const Business = require("../model/businessModel");
const OTP = require("../model/otpModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const fs = require('fs'); 

// --- Configuration Setup ---
// Cloudinary config
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => Math.floor(1000 + Math.random() * 9000);

// Send OTP
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    const otp = generateOTP();

    // Create or Update OTP record using entityId (business._id) and email
    await OTP.findOneAndUpdate(
        { email, entityId: business._id },
        { otp, isUsed: false, createdAt: new Date() },
        { upsert: true, new: true }
    );

    await transporter.sendMail({
      from: '"Pet Connect" <no-reply@app.com>',
      to: email,
      subject: "Business OTP Verification",
      text: `Your OTP is: ${otp}`,
    });

    res.status(200).json({ success: true, message: "OTP sent successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP.", error: error.message });
  }
};

// Resend OTP - Just an alias for sendOTP
const resendOTP = sendOTP; 

// Verify OTP - Updates status from 'Unverified' to 'Pending'
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp, isUsed: false });
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
    }
    
    const business = await Business.findById(otpRecord.entityId);
    if (!business) {
        return res.status(404).json({ success: false, message: "Associated Business not found." });
    }
    
    // Update status only if it was 'Unverified'
    if (business.businessStatus === "Unverified") {
        business.businessStatus = "Pending";
        await business.save();
    }
    
    otpRecord.isUsed = true;
    await otpRecord.save();

    res.status(200).json({ 
        success: true, 
        message: "OTP verified successfully. Business is now pending admin review." 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "OTP verification failed." });
  }
};

// Update Password using OTP (For Forgot Password)
const updatePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;

    const otpRecord = await OTP.findOne({ otp, isUsed: true }); 
    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "Invalid OTP or OTP not verified." });
    }

    const business = await Business.findById(otpRecord.entityId);
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    business.password = await bcrypt.hash(newPassword, 10);
    await business.save();
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update password." });
  }
};


// Register
const register = async (req, res) => {
  try {
    const { businessName, username, email, phoneNumber, password, location } = req.body;

    if (!businessName || !username || !email || !phoneNumber || !password) {
      return res.status(400).json({ success: false, message: "All required fields are missing." });
    }

    const exists = await Business.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(400).json({ success: false, message: "Business already exists (Email or Username)." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newBusiness = await Business.create({
      businessName,
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      location,
      businessStatus: "Unverified",
    });
    
    await sendOTP({ body: { email: newBusiness.email } }, res); 

    return res.status(201).json({ 
        success: true, 
        message: "Business registered successfully. OTP sent for verification.", 
        businessId: newBusiness._id 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Registration failed." });
  }
};

// Login
const loginBusiness = async (req, res) => {
  try {
    const { username, password } = req.body;

    const business = await Business.findOne({ username });
    if (!business) {
      return res.status(404).json({ success: false, message: "Business not found." });
    }

    const isMatched = await bcrypt.compare(password, business.password);
    if (!isMatched) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }
    
    if (business.businessStatus === "Unverified") {
        return res.status(403).json({ success: false, message: "Email not verified. Please verify using OTP." });
    }
    if (business.businessStatus === "Pending") {
        return res.status(403).json({ success: false, message: "Registration pending admin review." });
    }
    if (business.businessStatus === "Rejected") {
        return res.status(403).json({ success: false, message: "Registration rejected by admin." });
    }

    const token = jwt.sign(
      { id: business._id, role: business.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const { password: _, ...safeBusiness } = business.toObject();

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      businessData: safeBusiness,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed." });
  }
};

const uploadDocument = async (req, res) => {
    let localFilePath = req.file ? req.file.path : null; 
    
    try {
      const businessId = req.user?.id; 
      if (!businessId) throw new Error("Unauthorized: No business ID found");
      if (!req.file) throw new Error("No document uploaded");

      const business = await Business.findById(businessId);
      if (!business) throw new Error("Business not found");
      
      const uploadResult = await cloudinary.uploader.upload(localFilePath, {
          folder: `business_documents/${business.username}`,
          resource_type: "auto",
      });

      const documentUrl = uploadResult.secure_url;
      
      business.businessDocument = documentUrl;
      business.businessStatus = "Pending";
      const updated = await business.save();

      if (localFilePath) {
          fs.unlinkSync(localFilePath); 
          localFilePath = null;
      }

      res.status(200).json({ 
        success: true, 
        message: "Document uploaded successfully and awaiting admin review.", 
        document: updated.businessDocument 
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    
      if (localFilePath) {
          try {
              fs.unlinkSync(localFilePath);
          } catch (cleanupError) {
              console.error("Failed to clean up local file after error:", cleanupError.message);
          }
      }
    }
};

const approveBusiness = async (req, res) => {
    try {
      const { businessId } = req.params;
      const { action } = req.body; 

      const business = await Business.findById(businessId);
      if (!business) throw new Error("Business not found");

      if (action === "Approve") {
        business.businessVerified = true;
        business.businessStatus = "Approved";
      } else if (action === "Reject") {
        business.businessVerified = false;
        business.businessStatus = "Rejected";
      } else {
        return res.status(400).json({ success: false, message: "Invalid action. Must be 'Approve' or 'Reject'." });
      }

      const updated = await business.save();

      res.status(200).json({
        success: true,
        message: `Business ${action}d successfully`,
        businessStatus: updated.businessStatus,
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
};


const getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().select("-password");
    res.status(200).json({ success: true, businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch businesses." });
  }
};


module.exports = {
  sendOTP,
  resendOTP,
  verifyOTP,
  updatePassword,
  register,
  loginBusiness,
  uploadDocument,
  approveBusiness,
  getAllBusinesses,
};