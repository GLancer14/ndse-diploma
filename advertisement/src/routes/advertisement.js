const express = require("express");
const fs = require("fs");
const fileMulter = require("../middleware/file");
const AdsModule = require("../basicModules/ads");
const Users = require("../basicModules/users");
const isAuth = require("../middleware/isAuth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const ads = await AdsModule.find(req.query);
    const adsObjects = await Promise.all(ads.map(async (ad) => {
      const adAuhtor = await Users.findById(ad.userId);
      return {
        id: ad.id,
        shortText: ad.shortText,
        description: ad.description,
        images: ad.images,
        user: {
          id: ad.userId,
          name: adAuhtor?.name,
        },
        createdAt: ad.createdAt,
      };
    }));
    res.json({
      data: adsObjects,
      status: "ok",
    });
  } catch(e) {
    res.json({
      error: e.message,
      status: "error",
    });
  }
});

router.post("/", isAuth, fileMulter.array("images"), async (req, res) => {
  try {
    const reqData = {
      ...req.body,
      userId: req.user.id,
      images: req.files.map(fileInfo => `${fileInfo.destination}/${fileInfo.filename}`),
      isDeleted: false,
    };
    const newAds = await AdsModule.create(reqData);
    res.json({
      data: {
        id: newAds.id,
        shortText: newAds.shortText,
        description: newAds.description,
        images: newAds.images,
        user: {
          id: req.user.id,
          name: req.user.name,
        },
        createdAt: newAds.createdAt,
      },
      status: "ok",
    });
  } catch(e) {
    if (req?.files) {
      req.files.forEach(fileInfo => fs.rmSync(`${fileInfo.destination}/${fileInfo.filename}`));
    }

    res.json({
      error: e.message,
      status: "error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ad = await AdsModule.findById(req.params.id);
    if (ad) {
      const adAuhtor = await Users.findById(ad.userId);
      res.json({
        data: {
          id: ad.id,
          shortText: ad.shortText,
          description: ad.description,
          images: ad.images,
          user: {
            id: ad.userId,
            name: adAuhtor?.name,
          },
          createdAt: ad.createdAt,
        },
        status: "ok",
      });
    } else {
      res.status(404).json({
        error: "Объявление не найдено",
        status: "error",
      });
    }
  } catch(e) {
    res.json({
      error: e.message,
      status: "error",
    });
  }
});

router.delete("/:id", isAuth, async (req, res) => {
  try {
    const deletingAd = await AdsModule.findById(req.params.id);
    if (deletingAd) {
      if (req.user.id !== deletingAd.userId.toString()) {
        return res.status(403).json({
          error: "Вы не можете удалить чужое объявление",
          status: "error",
        });
      }

      const ad = await AdsModule.remove(req.params.id);
      if (ad) {
        res.json({
          data: `Объявление ${req.params.id} удалено`,
          status: "ok",
        });
      }
    } else {
      res.json({
        error: "Объявление не найдено",
        status: "error",
      });
    }
  } catch(e) {
    res.json({
      error: e.message,
      status: "error",
    });
  }
});

module.exports = router;
