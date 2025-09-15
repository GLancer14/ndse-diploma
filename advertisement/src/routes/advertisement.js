const express = require("express");
const fs = require("fs");
const fileMulter = require("../middleware/file");
const AdsModule = require("../basicModules/ads");
const Users = require("../basicModules/users");
const isAuth = require("../middleware/isAuth");
const { responseHandler, errorResponseHandler } = require("../utils/responseHandlers");

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

    responseHandler(res, adsObjects);
  } catch(e) {
    errorResponseHandler(res, e.message);
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
    const resData = {
      id: newAds.id,
      shortText: newAds.shortText,
      description: newAds.description,
      images: newAds.images,
      user: {
        id: req.user.id,
        name: req.user.name,
      },
      createdAt: newAds.createdAt,
    };

    responseHandler(res, resData);
  } catch(e) {
    if (req?.files) {
      req.files.forEach(fileInfo => fs.rmSync(`${fileInfo.destination}/${fileInfo.filename}`));
    }

    errorResponseHandler(res, e.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const ad = await AdsModule.findById(req.params.id);
    if (ad) {
      const adAuhtor = await Users.findById(ad.userId);
      const resData = {
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

      responseHandler(res, resData);
    } else {
      errorResponseHandler(res, "Объявление не найдено", 404);
    }
  } catch(e) {
    errorResponseHandler(res, e.message);
  }
});

router.delete("/:id", isAuth, async (req, res) => {
  try {
    const deletingAd = await AdsModule.findById(req.params.id);
    if (deletingAd) {
      if (req.user.id !== deletingAd.userId.toString()) {
        return errorResponseHandler(res, "Вы не можете удалить чужое объявление", 403);
      }

      const ad = await AdsModule.remove(req.params.id);
      if (ad) {
        responseHandler(res, `Объявление ${req.params.id} удалено`);
      }
    } else {
      errorResponseHandler(res, "Объявление не найдено", 404);
    }
  } catch(e) {
    errorResponseHandler(res, e.message);
  }
});

module.exports = router;
