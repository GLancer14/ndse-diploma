const express = require("express");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const router = express.Router();
const Users = require("../basicModules/users");
const UsersModel = require("../models/users");
const authStrategy = require("../middleware/strategy");

passport.use("local", authStrategy);

passport.serializeUser((user, cb) => {
  cb(null, user.email);
});

passport.deserializeUser(async (email, cb) => {
  try {
    const user = await Users.findByEmail(email);
    cb(null, user);
  } catch(e) {
    cb(e);
  }
});

router.post("/signin", (req, res) => {
  passport.authenticate("local", (err, user) => {
    if (err) {
      return res.status(500).json({
        error: "Ошибка сервера",
        status: "error",
      });
    }

    if (!user) {
      return res.status(401).json({
        error: "Неверный логин или пароль",
        status: "error",
      });
    }

    req.login(user, err => {
      if (err) {
        throw err;
      }

      return res.json({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          contactPhone: user.contactPhone,
        },
        status: "ok",
      });
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
    res.json({ data: registredUser, status: "ok" });
  } catch(e) {
    if (e.code === 11000) {
      res.json({
        error: "email занят",
        status: "error",
      });
    } else {
      res.json({
        error: e.message,
        status: "error",
      });
    }
  }
});

module.exports = router;