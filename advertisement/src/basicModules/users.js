const Users = require("../models/users");

class UserModule {
  static async create(data) {
    const newUser = new Users({ ...data });
    try {
      const createdUser = await newUser.save();

      return {
        data: {
          id: createdUser._id,
          email: createdUser.email,
          name: createdUser.name,
          contactPhone: createdUser.contactPhone,
        },
        status: "ok",
      };
    } catch(e) {
      return e;
    }
  }

  static async findByEmail(email) {
    try {
        const user = await Users.findOne({ email: email });
        if (user) {
          return {
            id: user._id,
            email: user.email,
            passwordHash: user.passwordHash,
            name: user.name,
            contactPhone: user.contactPhone,
          };
        }
      } catch(e) {
        console.log(e);
      }
  }
}

module.exports = UserModule;