const Business = require("../models/business.model");

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
    return Business.find({ businessStatus: "APPROVED" });
  }

  update(business) {
    return business.save();
  }

  delete(businessId) {
    return Business.findByIdAndDelete(businessId);
  }

  findNearby(latitude, longitude) {
    return Business.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
          distanceField: "distance",
          spherical: true,
          distanceMultiplier: 0.001,
        },
      },
      { $match: { businessStatus: "APPROVED" } },
    ]);
  }
}

module.exports = new BusinessRepository();
