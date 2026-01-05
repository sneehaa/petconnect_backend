const Adoption = require("../models/adoption.model");

class AdoptionRepository {
  create(adoptionData) {
    return Adoption.create(adoptionData);
  }

  findById(id) {
    return Adoption.findById(id);
  }

  findByUser(userId) {
    return Adoption.find({ userId }).sort({ createdAt: -1 });
  }

  findByPet(petId) {
    return Adoption.find({ petId }).sort({ createdAt: -1 });
  }

  findUserPetAdoption(userId, petId) {
    return Adoption.findOne({ userId, petId });
  }

  updateStatus(adoptionId, status) {
    return Adoption.findByIdAndUpdate(adoptionId, { status }, { new: true });
  }
}

module.exports = new AdoptionRepository();
