// business.repository.js - SINGLE VERSION
const Business = require("../models/business.model");

class BusinessRepository {
  create(data) {
    return Business.create(data);
  }

  findById(id) {
    return Business.findById(id);
  }

  findByEmail(email) {
    return Business.findOne({ email });
  }

  async findByEmailRaw(email) {
    return Business.findOne({ email }).select("+password");
  }

  findByUsername(username) {
    return Business.findOne({ username });
  }

  findApproved() {
    return Business.find({ businessStatus: "Approved" });
  }

  update(id, data) {
    return Business.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id) {
    return Business.findByIdAndDelete(id);
  }

  findAll(filter = {}) {
    return Business.find(filter);
  }
}

module.exports = new BusinessRepository();
