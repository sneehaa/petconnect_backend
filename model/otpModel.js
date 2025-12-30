const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    email: {
      type: String,
      required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    isUsed: {
        type: Boolean,
        default: false, 
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '5m',
    }
});

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;