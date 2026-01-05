const adoptionRepo = require("../repositories/adoption.repository");
const axios = require("axios");

class AdoptionService {
  async applyAdoption(userId, petId, data) {
    // validate pet exists in pet-service
    await this._checkPetExists(petId);

    // check if user already applied for this pet
    const existing = await adoptionRepo.findUserPetAdoption(userId, petId);
    if (existing) throw new Error("You have already applied for this pet");

    const adoption = await adoptionRepo.create({
      petId,
      userId,
      status: "pending",
      message: data.message || "",
    });

    return adoption;
  }

  async getAdoptionStatus(userId, petId) {
    const adoption = await adoptionRepo.findUserPetAdoption(userId, petId);
    if (!adoption) throw new Error("No adoption application found");
    return adoption;
  }

  async getAdoptionHistory(userId) {
    return adoptionRepo.findByUser(userId);
  }

  async getPetAdoptions(petId) {
    return adoptionRepo.findByPet(petId);
  }

  async updateAdoptionStatus(adoptionId, status) {
    const updated = await adoptionRepo.updateStatus(adoptionId, status);
    if (!updated) throw new Error("Adoption request not found");
    return updated;
  }

  // ===== Helpers =====
  async _checkPetExists(petId) {
    try {
      await axios.get(`${process.env.PET_SERVICE_URL}/pets/${petId}`);
    } catch (err) {
      throw new Error("Pet not found or pet-service unavailable");
    }
  }
}

module.exports = new AdoptionService();
