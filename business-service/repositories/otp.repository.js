const OTP = require("../models/otp.model");

class OtpRepository {
  create(data) {
    return OTP.create(data);
  }

  findByEmail(email) {
    return OTP.findOne({ email }).sort({ createdAt: -1 });
  }

  findValidOtp(otp) {
    return OTP.findOne({ otp, isUsed: false });
  }

  deleteByEmail(email) {
    return OTP.deleteMany({ email });
  }

  deleteById(id) {
    return OTP.deleteOne({ _id: id });
  }
}

module.exports = new OtpRepository();
