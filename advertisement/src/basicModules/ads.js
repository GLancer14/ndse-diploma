const { default: mongoose } = require("mongoose");
const Ads = require("../models/ads");

class AdsModule {
  static async find(params) {
    let searchParams = {
      $where: "this.isDeleted === false",
    };
    if (Object.keys(params).length !== 0) {
      searchParams = {
        $or: [
          { shortText: params?.shortText ? { $regex: params.shortText } : undefined },
          { description: params?.description ? { $regex: params.description } : undefined },
          { userId: params?.userId },
          { tags: params?.tags ? { $all: params.tags } : undefined },
        ],
        $where: "this.isDeleted === false",
      };
    }

    try {
      return await Ads.find(searchParams);
    } catch(e) {
      throw e;
    }
  }

  static async findById(id) {
    try {
      return await Ads.findById(id);
    } catch(e) {
      throw e;
    }
  }

  static async create(data) {
    try {
      const newAds = new Ads(data);
      return await newAds.save();
    } catch(e) {
      throw e;
    }
  }

  static async remove(id) {
    try {
      return await Ads.findByIdAndUpdate(id, { isDeleted: true });
    } catch(e) {
      throw e;
    }
  }
}

module.exports = AdsModule;