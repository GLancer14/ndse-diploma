const Chats = require("../models/chats");
const { subscribeEmitter, subscribeListenersStorage } = require("../utils/subscribeEmitter");

class ChatModule {
  static async find(users) {
    try {
      console.log("users: " + users);
      const chat = await Chats.findOne({
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

  static async findAllUsersChats(user) {
    try {
      const chats = await Chats.find({
        users: {
          $all: [ user ],
        }
      });

      if (chats) {
        return chats;
      } else {
        console.log("Чаты не найдены.");
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
      const chat = await Chats.findOne({
        $or: [
          { users: [ data.author, data.recevier ] },
          { users: [ data.recevier, data.author ] },
        ],
      });

      // console.log(chat)

      if (!chat) {
        const newChat = new Chats({
          users: [ data.author, data.recevier ],
          createdAt: newChatDate,
          messages: [ newMessage ],
        });

        try {
          await newChat.save();
          // this.subscribe((chatId, message) => {
          //   console.log("Subscribe", chatId, message);
          // });

          return newMessage;
        } catch(e) {
          throw new Error(e);
        }
      } else {
        try {
          const existingChat = await Chats.findByIdAndUpdate(chat.id, {
            $push: { messages: newMessage },
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

  static subscribe(chatId, cb) {
    subscribeEmitter.on(chatId, cb);
    // console.log(subscribeEmitter.listeners("newMessage"))
  }

  static async getHistory(id) {
    try {
      const chat = await Chats.findById(id);
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