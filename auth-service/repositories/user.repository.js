const Users = require("../models/user.model");

class UserRepository {
  findByEmail(email) {
    return Users.findOne({ email });
  }

  findByUsername(username) {
    return Users.findOne({ username });
  }

  findById(id) {
    return Users.findById(id);
  }

  create(data) {
    return Users.create(data);
  }

  updateById(id, data) {
    return Users.findByIdAndUpdate(id, data, { new: true });
  }

  deleteById(id) {
    return Users.findByIdAndDelete(id);
  }

  getAll(skip, limit) {
    return Users.find().select("-password").skip(skip).limit(limit);
  }
}

module.exports = new UserRepository();
