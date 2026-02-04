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
    return await Pet.find();
  }

  async findByBusiness(businessId) {
    return await Pet.find({ businessId });
  }

  async findAvailable() {
    return await Pet.find({ status: "available" });
  }

  async exists(id) {
    return await Pet.exists({ _id: id });
  }
}

module.exports = new PetRepository();
