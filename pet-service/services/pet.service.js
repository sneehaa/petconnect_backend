const petRepo = require("../repositories/pet.repository");
const axios = require("axios");

class PetService {
  async createPet(businessId, petData) {
    try {
      await axios.get(`${process.env.BUSINESS_SERVICE_URL}/business/${businessId}`);
    } catch {
      throw new Error("Business not found or not approved");
    }

    petData.businessId = businessId;
    return petRepo.create(petData);
  }

  async getPetById(petId) {
    const pet = await petRepo.findById(petId);
    if (!pet) throw new Error("Pet not found");

    try {
      const businessRes = await axios.get(
        `${process.env.BUSINESS_SERVICE_URL}/business/${pet.businessId}`
      );
      return { ...pet.toObject(), business: businessRes.data };
    } catch {
      return { ...pet.toObject(), business: null };
    }
  }

  async getPetsByBusiness(businessId) {
    return petRepo.findByBusiness(businessId);
  }

  async getAllPets() {
    const pets = await petRepo.getAll();
    
    const petsWithBusiness = await Promise.all(
      pets.map(async (pet) => {
        try {
          const businessRes = await axios.get(
            `${process.env.BUSINESS_SERVICE_URL}/business/${pet.businessId}`
          );
          return { ...pet.toObject(), business: businessRes.data };
        } catch {
          return { ...pet.toObject(), business: null };
        }
      })
    );
    
    return petsWithBusiness;
  }

  async updatePet(petId, data) {
    return petRepo.update(petId, data);
  }

  async deletePet(petId) {
    const pet = await petRepo.delete(petId);
    if (!pet) throw new Error("Pet not found");
    return pet;
  }
}

module.exports = new PetService();