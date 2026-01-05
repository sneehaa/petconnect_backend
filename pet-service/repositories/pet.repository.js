const Pet = require("../models/pet.model");

class PetRepository {
  create(data) {
    return Pet.create(data);
  }

  findById(id) {
    return Pet.findById(id);
  }

  findByBusiness(businessId) {
    return Pet.find({ businessId });
  }

  update(id, data) {
    return Pet.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id) {
    return Pet.findByIdAndDelete(id);
  }

  getAll() {
    return Pet.find();
  }

  deleteByBusiness(businessId) {
    return Pet.deleteMany({ businessId });
  }
}

module.exports = new PetRepository();
