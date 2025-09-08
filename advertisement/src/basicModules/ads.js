const { default: mongoose } = require("mongoose");
const Ads = require("../models/ads");

class AdsModule {
  static async find(params) {
    let searchParams = {};
    if (params) {
      searchParams = {
        $or: [
          { shortText: { $regex: params.shortText, options: "i" } },
          { description: { $regex: params.description, options: "i" } },
          { userId: params.userId },
          { tags: { $all: params.tags } },
        ],
        $where: () => {
          return this.isDeleted === false;
        },
      };
    }

    try {
      const ads = await Ads.find(searchParams);
      
      if (ads) {
        return {
          data: ads,
          status: "ok",
        };
      } else {
        console.log("Нет совпадений");
        return [];
      }
    } catch(e) {
      console.log(e);
    }
  }

  static async findById(id) {
    try {
      const ads = await Ads.findById(id);
      
      if (ads) {
        return {
          data: ads,
          status: "ok",
        };
      } else {
        console.log("Нет совпадений");
      }
    } catch(e) {
      console.log(e);
    }
  }

  static async create(data) {
    const createdAt = Date.now();
    const newAds = new Ads({
      ...data.body,
      userId: data.user._id,
      images: data.files.map(fileInfo => `${fileInfo.destination}/${fileInfo.filename}`),
      isDeleted: false,
      updatedAt: createdAt,
      createdAt: createdAt,
    });
    try {
      await newAds.save();

      return {
        data: {
          id: newAds.id,
          shortText: newAds.shortText,
          description: newAds.description,
          images: newAds.images,
          user: {
            id: data.user.id,
            name: data.user.name,
          },
          createdAt: newAds.createdAt,
        },
        status: "ok",
      };
    } catch(e) {
      throw e;
    }
  }

  static async remove(id) {
    try {
      const adsUpdated = await Ads.findByIdAndUpdate(id, { isDeleted: true });
      if (adsUpdated) {
        return adsUpdated;
      }
    } catch(e) {
      throw e;
    }
  }
}

module.exports = AdsModule;