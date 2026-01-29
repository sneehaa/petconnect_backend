const Pet = require("../database/models/Pet");

class PetService {
  async getAllPets() {
    return Pet.find();
  }

  async removePet(id) {
    const pet = await Pet.findById(id);
    if (!pet) throw new Error("Pet not found");
    pet.status = "Removed";
    await pet.save();
    return pet;
  }
}

module.exports = new PetService();
