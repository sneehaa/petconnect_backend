const OTP = require("../models/otp.model");

class OtpRepository {
  create(data) {
    return OTP.create(data);
  }

  findByEmail(email) {
    return OTP.findOne({ email });
  }

  findValidOtp(otp) {
    return OTP.findOne({ otp, isUsed: false });
  }

  findUsedOtp(otp) {
    return OTP.findOne({ otp, isUsed: true });
  }

  deleteById(id) {
    return OTP.deleteOne({ _id: id });
  }
}

module.exports = new OtpRepository();
