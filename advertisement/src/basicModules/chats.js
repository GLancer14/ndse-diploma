const Chat = require("../models/chats");
const subscribeEmitter = require("../utils/subscribeEmitter");

class ChatModule {
  static async find(users) {
    try {
      console.log(users);
      const chat = await Chat.findOne({
        $or: [
          { users: users },
          { users: [...users].reverse() },
        ]
      });
      if (chat) {
        return chat;
      } else {
        console.log("Чат не найден.");
        return null;
      }
    } catch(e) {
      console.log(e);
    }
  }

  static async sendMessage(data) {
    if (!data.author || !data.recevier || !data.text) {
      return;
    }

    const newChatDate = Date.now();
    const newMessage = {
      author: data.author,
      sentAt: newChatDate,
      text: data.text,
    };
    
    try {
      const chat = await chat.findOne({
        $or: [
          { users: [ data.author, data.recevier ] },
          { users: [ data.recevier, data.author ] },
        ],
      });

      if (!chat) {
        const newChat = new Chat({
          users: [ data.author, data.recevier ],
          createdAt: newChatDate,
          messages: [ newMessage ],
        });

        try {
          await newChat.save();
    
          return newMessage;
        } catch(e) {
          throw new Error(e);
        }
      } else {
        try {
          const existingChat = await Chat.findByIdAndUpdate(chat._id, {
            messages: { $push: newMessage },
          });

          if (existingChat) {
            return newMessage;
          } else {
            console.log("Чат не найден.");
            return null;
          }
        } catch(e) {
          throw new Error(e);
        }
      }
    } catch(e) {
      console.log(e);
    }
  }

  static subscribe(cb) {
    subscribeEmitter.on("subscribe", () => {
      cb(data);
    });
  }

  static async getHistory(id) {
    try {
      const chat = await Chat.findById(id);
      if (chat) {
        return chat.messages;
      } else {
        console.log("Чат не найден.");
        return null;
      }
    } catch(e) {
      console.log(e);
    }
  }
}

module.exports = ChatModule;