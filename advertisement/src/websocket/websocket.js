const Chats = require("../basicModules/chats");
const { subscribeEmitter, subscribeListenersStorage } = require("../utils/subscribeEmitter");

function createSocketConnection(io) {
  io.on("connection", async (socket) => {
    const { id } = socket;
    console.log(`Socket connected: ${id}`);
    
    const { userId } = socket.handshake.query;

    const userChats = await Chats.findAllUsersChats(userId);

    userChats.forEach((chat) => {
      try {
        socket.join(`${userId}/${chat.id}`);
        const subscribeListener = (chatId, message) => {
          if (chatId === chat.id) {
            const recevier = chat.users.filter(user => user.toString() !== message.author.toString())[0].toString();
            console.log(`${recevier}/${chat.id}`)
            socket.to(`${recevier}/${chat.id}`).emit("newMessage", message);
            socket.emit("newMessage", message);
          }
        };

        subscribeListenersStorage.set(`${userId}/${chat.id}`, subscribeListener);
        Chats.subscribe(`${userId}/${chat.id}`, subscribeListener);
      } catch(e) {
        socket.emit("newMessage", {
          error: "Ошибка при отправке сообщения",
          status: "error",
        });
      }
    });

    socket.on("getHistory", async (receiverId) => {
      try {
        const chat = await Chats.find([userId, receiverId]);
        socket.emit("chatHistory", chat.messages);
      } catch(e) {
        console.log(e.message);
        socket.emit("chatHistory", {
          error: "Ошибка при получении истории чата",
          status: "error",
        });
      }
    });

    socket.on("sendMessage", async (messageData) => {
      try {
        let newMessage;
        let chat = await Chats.find([messageData.author, messageData.recevier]);
        if (chat) {
          newMessage = await Chats.sendMessage(messageData);
        } else {
          newMessage = await Chats.sendMessage(messageData);
          chat = await Chats.find([messageData.author, messageData.recevier]);

          socket.join(`${userId}/${chat.id}`);
          const authorSubscribeListener = (chatId, message) => {
            if (chatId === chat.id) {
              console.log("New chat's message:", message)

              const recevier = chat.users.filter(user => user.toString() !== message.author.toString())[0].toString();
              socket.to(`${recevier}/${chat.id}`).emit("newMessage", message);
              socket.emit("newMessage", message);
            }
          };

          let recevierSocket = Array.from(io.sockets.sockets).find(socket => {
            return messageData.recevier === socket[1].handshake.query.userId
          })[1];

          recevierSocket.join(`${messageData.recevier}/${chat.id}`);
          const recevierSubscribeListener = (chatId, message) => {
            if (chatId === chat.id) {
              const recevier = chat.users.filter(user => user.toString() === message.author.toString())[0].toString();
              recevierSocket.to(`${recevier}/${chat.id}`).emit("newMessage", message);
              recevierSocket.emit("newMessage", message);
            }
          };

          subscribeListenersStorage.set(`${userId}/${chat.id}`, authorSubscribeListener);
          subscribeListenersStorage.set(`${messageData.recevier}/${chat.id}`, recevierSubscribeListener);

          Chats.subscribe(`${userId}/${chat.id}`, authorSubscribeListener);
          Chats.subscribe(`${messageData.recevier}/${chat.id}`, recevierSubscribeListener);
        }

        subscribeEmitter.emit(`${userId}/${chat.id}`, chat.id, newMessage);
      } catch(e) {
        console.log(e.message);
        socket.emit("newMessage", {
          error: "Ошибка при отправке сообщения",
          status: "error",
        });
      }
    });

    socket.on("disconnect", async () => {
      console.log(`Socket disconnected: ${id}`);
      const userChats = await Chats.findAllUsersChats(userId);
      userChats.forEach(chat => {
        const subscribeListener = subscribeListenersStorage.get(`${userId}/${chat.id}`);
        subscribeEmitter.removeListener(`${userId}/${chat.id}`, subscribeListener);
        subscribeListenersStorage.delete(`${userId}/${chat.id}`);
      });
    });
  });

  return io;
}

module.exports = createSocketConnection;