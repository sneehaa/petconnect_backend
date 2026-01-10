const mongoose = require('mongoose');

const adoptedPetSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
    adoptionDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdoptedPet', adoptedPetSchema);
