const Users = require("../models/users");

class UserModule {
  static async create(data) {
    try {
      const newUser = new Users({ ...data });
      const { id, email, name, contactPhone } = await newUser.save();

      return { id, email, name, contactPhone };
    } catch(e) {
      throw e;
    }
  }

  static async findById(id) {
    try {
      return await Users.findById(id);
    } catch(e) {
      throw e;
    }
  }

  static async findByEmail(email) {
    try {
      return await Users.findOne({ email });
    } catch(e) {
      throw e;
    }
  }
}

module.exports = UserModule;