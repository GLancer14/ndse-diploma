const Chats = require("../basicModules/chats");
const { subscribeEmitter, subscribeListenersStorage } = require("../utils/subscribeEmitter");

function createSocketConnection(io) {
  io.on("connection", async (socket) => {
    const { id } = socket;
    console.log(`Socket connected: ${id}`);
    
    const { userId } = socket.handshake.query;

    const userChats = await Chats.findAllUsersChats(userId);
    // console.log("CHats count", userChats.length)

    userChats.forEach((chat) => {
      socket.join(`${userId}/${chat.id}`);
      const subscribeListener = (chatId, message) => {
        if (chatId === chat.id) {
          console.log("Message:", message)
          const recevier = chat.users.filter(user => user !== message.author);
          socket.to(`${recevier}/${chat.id}`).emit("newMessage", message);
          socket.emit("newMessage", message);
        }
      };

      subscribeListenersStorage.set(`${userId}/${chat.id}`, subscribeListener);
      Chats.subscribe(`${userId}/${chat.id}`, subscribeListener);
    });

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
        socket.join(`${userId}/${chat.id}`);
        const subscribeListener = (chatId, message) => {
          if (chatId === chat.id) {
            console.log("New chat's message:", message)

            socket.to(`${messageDataParsed.recevier}/${chat.id}`).emit("newMessage", message);
            socket.emit("newMessage", message);
          }
        };

        subscribeListenersStorage.set(`${userId}/${chat.id}`, subscribeListener);
        Chats.subscribe(`${userId}/${chat.id}`, subscribeListener);
      }

      subscribeEmitter.emit(`${userId}/${chat.id}`, chat.id, newMessage);
    });

    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${id}`);
      const userChats = await Chats.findAllUsersChats(userId);
      console.log(userChats)
      userChats.forEach(chat => {

        // const subscribeListeners = subscribeListenersStorage.get(chat.id);
        const subscribeListener = subscribeListenersStorage.get(`${userId}/${chat.id}`);
        // subscribeListeners.forEach(listener => {
          subscribeEmitter.removeListener(`${userId}/${chat.id}`, subscribeListener);
        // });
        subscribeListenersStorage.delete(`${userId}/${chat.id}`);
      });
    });
  });

  return io;
}

module.exports = createSocketConnection;