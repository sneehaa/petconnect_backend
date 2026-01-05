const Business = require("./business.model");

class BusinessRepository {
  create(data) {
    return Business.create(data);
  }

  findById(id) {
    return Business.findById(id);
  }

  findByUsername(username) {
    return Business.findOne({ username });
  }

  findByUser(userId) {
    return Business.findOne({ createdBy: userId });
  }

  findApproved() {
    return Business.find({ status: "APPROVED" });
  }

  update(business) {
    return business.save();
  }
}

module.exports = new BusinessRepository();
