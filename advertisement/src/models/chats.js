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
    default: null,
  },
});

const chatsSchema = new Schema({
  users: {
    type: [ mongoose.Types.ObjectId, mongoose.Types.ObjectId ],
    required: true,
  },
  createdAt: {
    type: "date",
    required: true,
  },
  messages: {
    type: [ messagesSchema ],
    default: [],
  },
});

module.exports = model("chats", chatsSchema);