const Pet = require("../models/pet.model");

class PetRepository {
  async create(data) {
    return await Pet.create(data);
  }

  async update(id, data) {
    return await Pet.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Pet.findByIdAndDelete(id);
  }

  async findById(id) {
    return await Pet.findById(id);
  }

  async getAll() {
    return await Pet.find({ status: "available" });
  }

  async findByBusiness(businessId) {
    return await Pet.find({ businessId });
  }
}

module.exports = new PetRepository();
