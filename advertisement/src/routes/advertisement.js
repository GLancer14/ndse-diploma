const express = require("express");
const fs = require("fs");
const fileMulter = require("../middleware/file");
const AdsModule = require("../basicModules/ads");
const AdsModel = require("../models/ads");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const ads = await AdsModule.find();
    res.json(ads);
  } catch(e) {
    res.status(500).json(e);
  }
});

router.post("/", isAuth, fileMulter.array("images"), async (req, res) => {
  try {
    const newAds = await AdsModule.create(req);
    res.json(newAds);
  } catch(e) {
    console.log(e)
    res.status(500).json(e);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ads = await AdsModule.findById(req.params.id);
    if (ads) {
      res.json(ads);
    } else {
      res.status(404).json({
        error: "Объявление не найдено",
        status: "error",
      });
    }
  } catch(e) {
    res.status(500).json(e);
  }
});

router.delete("/:id", isAuth, async (req, res) => {
  try {
    const deletingAds = await AdsModule.findById(req.params.id);
    if (req.user.id !== deletingAds.data.userId.toString()) {
      return res.status(403).json({
        error: "Вы не можете удалить чужое объявление",
        status: "error",
      });
    }

    const ads = await AdsModule.remove(req.params.id);
    if (ads) {
      res.json({
        data: ads,
        status: "ok",
      })
    } else {
      res.json({
        error: "Объявление не найдено",
        status: "error",
      })
    }
  } catch(e) {
    console.log(e)
    res.status(500).json(e);
  }
});

module.exports = router;
