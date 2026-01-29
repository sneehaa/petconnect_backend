const User = require("../database/models/User");

class UserService {
  async getAllUsers() {
    return User.find();
  }
}

module.exports = new UserService();
