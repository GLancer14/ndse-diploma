const Chats = require("../basicModules/chats");
const { subscribeEmitter, subscribeListenersStorage } = require("../utils/subscribeEmitter");

function createSocketConnection(io) {
  io.on("connection", async (socket) => {
    const { id } = socket;
    console.log(`Socket connected: ${id}`);
    
    const { roomname } = socket.handshake.query;
    // console.log(`Socket room name: ${roomname}`);

    const userChats = await Chats.findAllUsersChats(roomname);
    // console.log(userChats)

    userChats.forEach(chat => {
      socket.join(`${chat.id}`);
      const subscribeListener = (chatId, message) => {
        if (chatId === chat.id) {
          console.log("Message:", message)
          socket.to(`${chatId}`).emit("newMessage", message);
        }
      };
      // const existingSocketListeners = subscribeListenersStorage.get(chat.id);
      // if (existingSocketListeners) {
      //   subscribeListenersStorage.set(chat.id, [...existingSocketListeners, subscribeListener]);
      // } else {
        // subscribeListenersStorage.set(chat.id, [subscribeListener]);
        subscribeListenersStorage.set(chat.id, subscribeListener);
      // }
      
      Chats.subscribe(subscribeListener);
    });

    // socket.join(roomname);
    socket.on("getHistory", async (receiverId) => {
      // const senderId = JSON.parse(Object.values(socket.request.sessionStore.sessions)[0]).passport.user;
      // const usersIdsParsed = JSON.parse(usersIds)
      const chat = await Chats.find([roomname, receiverId]);
      socket.emit("chatHistory", JSON.stringify(chat));
    });

    socket.on("sendMessage", async (messageData) => {
      const messageDataParsed = JSON.parse(messageData)
      const newMessage = await Chats.sendMessage(messageDataParsed);
      const chat = await Chats.find([messageDataParsed.author, messageDataParsed.recevier]);
      subscribeEmitter.emit("newMessage", chat.id, newMessage);
      // socket.emit("newMessage", newMessage);
    });

    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${id}`);
      const userChats = await Chats.findAllUsersChats(roomname);
      userChats.forEach(chat => {
        // const subscribeListeners = subscribeListenersStorage.get(chat.id);
        const subscribeListener = subscribeListenersStorage.get(chat.id);
        // subscribeListeners.forEach(listener => {
          subscribeEmitter.removeListener("newMessage", subscribeListener);
        // });
        subscribeListenersStorage.delete(chat.id);
      });
    });
  });

  return io;
}

module.exports = createSocketConnection;