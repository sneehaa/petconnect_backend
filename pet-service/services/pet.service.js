const petRepo = require("../repositories/pet.repository");
const axios = require("axios");

class PetService {
  async createPet(businessId, petData) {
    try {
      // Call business service to check if business exists AND is approved
      const businessResponse = await axios.get(
        `${process.env.BUSINESS_SERVICE_URL}/${businessId}`
      );
      
      // Check if business exists and is approved
      if (!businessResponse.data.success || !businessResponse.data.business) {
        throw new Error("Business not found");
      }
      
      const business = businessResponse.data.business;
      if (business.businessStatus !== "Approved") {
        throw new Error("Business not approved");
      }
      
      petData.businessId = businessId;
      return petRepo.create(petData);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new Error("Business not found");
      } else if (error.message.includes("not approved")) {
        throw error; // Re-throw the "not approved" error
      } else {
        throw new Error("Business verification failed: " + error.message);
      }
    }
  }

  async getPetById(petId) {
    const pet = await petRepo.findById(petId);
    if (!pet) throw new Error("Pet not found");

    try {
      const businessRes = await axios.get(
        `${process.env.BUSINESS_SERVICE_URL}/${pet.businessId}`
      );
      
      if (businessRes.data.success && businessRes.data.business) {
        return { ...pet.toObject(), business: businessRes.data.business };
      }
      return { ...pet.toObject(), business: null };
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
            `${process.env.BUSINESS_SERVICE_URL}/${pet.businessId}`
          );
          
          if (businessRes.data.success && businessRes.data.business) {
            return { ...pet.toObject(), business: businessRes.data.business };
          }
          return { ...pet.toObject(), business: null };
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