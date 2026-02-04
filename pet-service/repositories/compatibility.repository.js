const Compatibility = require("../models/compatibility.model");

class CompatibilityRepository {
  create(data) {
    return Compatibility.create(data);
  }

  findByUserId(userId) {
    return Compatibility.findOne({ userId });
  }

  update(userId, data) {
    return Compatibility.findOneAndUpdate({ userId }, data, {
      new: true,
      upsert: true,
      runValidators: true,
    });
  }

  delete(userId) {
    return Compatibility.findOneAndDelete({ userId });
  }

  exists(userId) {
    return Compatibility.exists({ userId });
  }
}

module.exports = new CompatibilityRepository();
