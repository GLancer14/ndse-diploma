const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const adsSchema = new Schema({
  shortText: {
    type: "string",
    required: true,
  },
  description: {
    type: "string",
    default: "",
  },
  images: {
    type: "array",
    default: [],
  },
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  tags: {
    type: "array",
    default: [],
  },
  isDeleted: {
    type: "boolean",
    required: true,
  },
}, { timestamps: true });

module.exports = model("Advertisements", adsSchema);