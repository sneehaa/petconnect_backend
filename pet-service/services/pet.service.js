const petRepo = require("../repositories/pet.repository");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

class PetService {
  getPublicIdFromUrl(url) {
    const parts = url.split("/");
    const filename = parts.pop();
    const folder = parts.pop();
    return `${folder}/${filename.split(".")[0]}`;
  }

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
          if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
          console.error(error);
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
        try {
          const result = await cloudinary.uploader.upload(localPath, {
            folder: "pets",
          });
          uploadedUrls.push(result.secure_url);
          if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        } catch (error) {
          if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
        }
      }
      data.photos = uploadedUrls;
    }
    return petRepo.update(petId, data);
  }

  async deletePetDirect(petId) {
    const pet = await petRepo.findById(petId);
    if (!pet) throw new Error("Pet not found");

    if (pet.photos && pet.photos.length > 0) {
      for (const photoUrl of pet.photos) {
        try {
          const publicId = this.getPublicIdFromUrl(photoUrl);
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error(err);
        }
      }
    }
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
