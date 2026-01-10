const mongoose = require('mongoose');

const adoptionApplicationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
    appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdoptionApplication', adoptionApplicationSchema);
