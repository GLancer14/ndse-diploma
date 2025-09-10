const Chats = require("../basicModules/chats");
const { subscribeEmitter, subscribeListenersStorage } = require("../utils/subscribeEmitter");

function createSocketConnection(io) {
  io.on("connection", async (socket) => {
    const { id } = socket;
    console.log(`Socket connected: ${id}`);
    
    const { userId } = socket.handshake.query;
    // console.log(`Socket room name: ${roomname}`);

    const userChats = await Chats.findAllUsersChats(userId);
    // console.log("CHats count", userChats.length)

    userChats.forEach((chat, _, array) => {
      // console.log("array length", array.length)
      socket.join(`${chat.id}`);
      const subscribeListener = (chatId, message) => {
        if (chatId === chat.id) {
          // console.log("Message:", message)
          socket.to(`${chatId}`).emit("newMessage", message);
        }
      };

      subscribeListenersStorage.set(chat.id, subscribeListener);
      Chats.subscribe(chat.id, subscribeListener);
    });

    // console.log("Listeners count", subscribeEmitter.listeners("newMessage").length);

    // socket.join(roomname);
    socket.on("getHistory", async (receiverId) => {
      // const senderId = JSON.parse(Object.values(socket.request.sessionStore.sessions)[0]).passport.user;
      // const usersIdsParsed = JSON.parse(usersIds)
      const chat = await Chats.find([userId, receiverId]);
      socket.emit("chatHistory", JSON.stringify(chat));
    });

    socket.on("sendMessage", async (messageData) => {
      const messageDataParsed = JSON.parse(messageData);
      let newMessage;
      let chat = await Chats.find([messageDataParsed.author, messageDataParsed.recevier]);
      if (chat) {
        newMessage = await Chats.sendMessage(messageDataParsed);
      } else {
        newMessage = await Chats.sendMessage(messageDataParsed);
        chat = await Chats.find([messageDataParsed.author, messageDataParsed.recevier]);
        socket.join(`${chat.id}`);
        const subscribeListener = (chatId, message) => {
          // console.log("Message:", message)
          if (chatId === chat.id) {
            socket.to(`${chatId}`).emit("newMessage", message);
          }
        };

        subscribeListenersStorage.set(chat.id, subscribeListener);
        Chats.subscribe(subscribeListener);
      }

      subscribeEmitter.emit(chat.id, chat.id, newMessage);
    });

    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${id}`);
      const userChats = await Chats.findAllUsersChats(userId);
      userChats.forEach(chat => {
        // const subscribeListeners = subscribeListenersStorage.get(chat.id);
        const subscribeListener = subscribeListenersStorage.get(chat.id);
        // subscribeListeners.forEach(listener => {
          subscribeEmitter.removeListener(chat.id, subscribeListener);
        // });
        subscribeListenersStorage.delete(chat.id);
      });
    });
  });

  return io;
}

module.exports = createSocketConnection;