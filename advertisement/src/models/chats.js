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

const chatsSchema = new Schema({
  users: {
    type: "array",
    required: true,
  },
  createdAt: {
    type: "date",
    required: true,
  },
  messages: {
    type: [messagesSchema],
    default: [],
  },
});

module.exports = model("Chat", chatsSchema);