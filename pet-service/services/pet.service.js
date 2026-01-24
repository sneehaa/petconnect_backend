const petRepo = require("../repositories/pet.repository");

class PetService {
  async createPetDirect(petData) {
    return petRepo.create(petData);
  }

  async updatePetDirect(petId, data) {
    return petRepo.update(petId, data);
  }

  async deletePetDirect(petId) {
    return petRepo.delete(petId);
  }

  async getPetById(petId) {
    const pet = await petRepo.findById(petId);
    if (!pet) throw new Error("Pet not found");
    return pet;
  }

  async getAllPets() {
    return petRepo.getAll();
  }

  async getPetsByBusiness(businessId) {
    return petRepo.findByBusiness(businessId);
  }
}

module.exports = new PetService();
