const Compatibility = require("../models/compatibility.model");

class CompatibilityRepository {
  create(data) {
    return Compatibility.create(data);
  }

  findByUserId(userId) {
    return Compatibility.findOne({ userId }).sort({ createdAt: -1 });
  }

  update(userId, data) {
    return Compatibility.findOneAndUpdate({ userId }, data, {
      new: true,
      upsert: true,
    });
  }

  delete(userId) {
    return Compatibility.findOneAndDelete({ userId });
  }
}

module.exports = new CompatibilityRepository();
