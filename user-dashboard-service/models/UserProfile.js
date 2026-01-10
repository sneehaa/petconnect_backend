const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    email: String,
    phone: String,
    address: String,
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
