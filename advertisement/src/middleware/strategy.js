const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const Users = require("../basicModules/users");

const verify = async (email, password, done) => {
  try {
    const user = await Users.findByEmail(email);
    if (!user) {
      console.log("incorrect email");
      return done(null, false);
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      console.log("incorrect password");
      return done(null, false);
    }

    return done(null, user);
  } catch(e) {
    console.log(e);
    return done(e);
  }
};

const options = {
  usernameField: "email",
  passwordField: "password",
};

module.exports = new LocalStrategy(options, verify);