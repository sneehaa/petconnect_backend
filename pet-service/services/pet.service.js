const petRepo = require("../repositories/pet.repository");
const axios = require("axios");
const redisClient = require("../utils/redisClient");

class PetService {

async createPet(businessId, petData) {
  console.log('Creating pet for businessId:', businessId);
  
  try {
    await this._checkBusinessExists(businessId);
  } catch (error) {
    console.error('Business check failed:', error.message);

  }
  
  petData.businessId = businessId;
  const pet = await petRepo.create(petData);
  return pet;
}

  async getPetById(petId) {
    const pet = await petRepo.findById(petId);
    if (!pet) throw new Error("Pet not found");

    const business = await this._getBusiness(pet.businessId);
    return { ...pet.toObject(), business };
  }

  async getPetsByBusiness(businessId) {
    await this._checkBusinessExists(businessId);
    return petRepo.findByBusiness(businessId);
  }

  async getAllPets() {
    const pets = await petRepo.getAll();
    const enrichedPets = await Promise.all(
      pets.map(async (pet) => {
        const business = await this._getBusiness(pet.businessId);
        return { ...pet.toObject(), business };
      })
    );
    return enrichedPets;
  }

  async updatePet(petId, data) {
    const pet = await petRepo.update(petId, data);
    if (!pet) throw new Error("Pet not found");
    return pet;
  }

  async deletePet(petId) {
    const pet = await petRepo.delete(petId);
    if (!pet) throw new Error("Pet not found");
    return pet;
  }

  async deletePetsByBusiness(businessId) {
    return petRepo.deleteByBusiness(businessId);
  }

  //helper functions
  async _getBusiness(businessId) {
    const cacheKey = `business:${businessId}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const res = await axios.get(`${process.env.BUSINESS_SERVICE_URL}/${businessId}`);
      await redisClient.setEx(cacheKey, 300, JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      throw new Error("Business not found or service unavailable");
    }
  }

  async _checkBusinessExists(businessId) {
    try {
      await axios.get(`${process.env.BUSINESS_SERVICE_URL}/${businessId}`);
    } catch (err) {
      throw new Error("Business not found");
    }
  }
}

module.exports = new PetService();
