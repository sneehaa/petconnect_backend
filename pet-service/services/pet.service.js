const petRepo = require("../repositories/pet.repository");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

class PetService {
  async createPetDirect(petData) {
    if (petData.photos && petData.photos.length > 0) {
      const uploadedUrls = [];

      for (const localPath of petData.photos) {
        try {
          const result = await cloudinary.uploader.upload(localPath, {
            folder: "pets",
          });
          uploadedUrls.push(result.secure_url);

          if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        } catch (error) {
          console.error("Cloudinary upload error:", error);
        }
      }
      petData.photos = uploadedUrls;
    }

    return petRepo.create(petData);
  }

  async updatePetDirect(petId, data) {
    if (data.photos && data.photos.length > 0) {
      const uploadedUrls = [];
      for (const localPath of data.photos) {
        const result = await cloudinary.uploader.upload(localPath, {
          folder: "pets",
        });
        uploadedUrls.push(result.secure_url);
        if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      }
      data.photos = uploadedUrls;
    }
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
