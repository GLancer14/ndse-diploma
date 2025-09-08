const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const messagesSchema = new Schema({
  author: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  sentAt: {
    type: "date",
    required: true,
  },
  text: {
    type: "string",
    required: true,
  },
  readAt: {
    type: "date",
    default: "",
  },
});

module.exports = model("Message", messagesSchema);