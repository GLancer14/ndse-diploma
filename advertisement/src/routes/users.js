const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const Users = require("../basicModules/users");
const authStrategy = require("../middleware/strategy");
const { responseHandler, errorResponseHandler } = require("../utils/responseHandlers");

const router = express.Router();

passport.use("local", authStrategy);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const user = await Users.findById(id);
    cb(null, user);
  } catch(e) {
    cb(e);
  }
});

router.post("/signin", (req, res) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return errorResponseHandler(res, "Ошибка сервера", 500);
    }

    if (!user) {
      return errorResponseHandler(res, "Неверный логин или пароль", 401);
    }

    req.login(user, err => {
      if (err) {
        throw err;
      }

      const resData = {
        id: user.id,
        email: user.email,
        name: user.name,
        contactPhone: user.contactPhone,
      };

      responseHandler(res, resData);
    });
  })(req, res);
});

router.post("/signup", async (req, res) => {
  try {
    if (!req.body.password) {
      throw new Error("Введите пароль");
    }

    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const newUser = {
      email: req.body.email,
      passwordHash: passwordHash,
      name: req.body.name,
      contactPhone: req.body.contactPhone,
    };

    const registredUser = await Users.create(newUser);
    responseHandler(res, registredUser);
  } catch(e) {
    if (e.code === 11000) {
      errorResponseHandler(res, "email занят");
    } else {
      errorResponseHandler(res, e.message);
    }
  }
});

module.exports = router;