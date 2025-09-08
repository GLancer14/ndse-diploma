const socketIO = require("socket.io");
const Chats = require("../basicModules/chats");

function createSocketConnection(io) {
  io.on("connection", (socket) => {
    const { id } = socket;
    console.log(`Socket connected: ${id}`);

    socket.on("getHistory", async (usersIds) => {
      // const senderId = JSON.parse(Object.values(socket.request.sessionStore.sessions)[0]).passport.user;
      const usersIdsParsed = JSON.parse(usersIds)
      const chat = await Chats.find([usersIdsParsed.senderId, usersIdsParsed.receiverId]);
      socket.emit("chatHistory", JSON.stringify(chat));
    });

    socket.on("sendMessage", async (messageData) => {
      const messageDataParsed = JSON.parse(messageData)
      const chat = await Chats.sendMessage({ ...messageData });
      const chatId = await Chats.find([messageData.author, usersIdsParsed.receiver]);
      await Chats.subscribe(() => {

      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${id}`);
    });
  });

  return io;
}

module.exports = createSocketConnection;