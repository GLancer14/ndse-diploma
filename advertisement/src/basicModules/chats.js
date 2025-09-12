const Chats = require("../models/chats");
const { subscribeEmitter, subscribeListenersStorage } = require("../utils/subscribeEmitter");

class ChatModule {
  static async find(users) {
    try {
      return await Chats.findOne({ users: { $all: users } });
    } catch(e) {
      throw e;
    }
  }

  static async findAllUsersChats(user) {
    try {
      return await Chats.find({ users: { $all: [ user ] } });
    } catch(e) {
      throw e;
    }
  }

  static async sendMessage(data) {
    try {
      if (!(data.author && data.recevier && data.text)) {
        throw new Error("Отсутствуют необходимые данные для отправки сообщения");
      }

      const newChatDate = Date.now();
      const newMessage = {
        author: data.author,
        sentAt: newChatDate,
        text: data.text,
      };

      const chat = await Chats.findOne({ users: { $all: [ data.author, data.recevier ] }});

      if (!chat) {
        const newChat = new Chats({
          users: [ data.author, data.recevier ],
          createdAt: newChatDate,
          messages: [ newMessage ],
        });

        const newSavedChat = await newChat.save();
        return newSavedChat.messages[newSavedChat.messages.length - 1];
      } else {
        const existingChat = await Chats.findByIdAndUpdate(chat.id, {
          $push: { messages: newMessage },
        });

        if (existingChat) {
          return existingChat.messages[existingChat.messages.length - 1];
        } else {
          console.log("Чат не найден.");
          return null;
        }
      }
    } catch(e) {
      throw e;
    }
  }

  static subscribe(chatId, cb) {
    subscribeEmitter.on(chatId, cb);
  }

  static async getHistory(id) {
    try {
      const chat = await Chats.findById(id);
      if (chat) {
        return chat.messages;
      } else {
        return null;
      }
    } catch(e) {
      throw e;
    }
  }
}

module.exports = ChatModule;