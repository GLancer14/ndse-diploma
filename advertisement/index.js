const express = require("express");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const http = require("http");
const socketIO = require("socket.io");
const usersRoutes = require("./src/routes/users");
const advertisementRoutes = require("./src/routes/advertisement");
const error404 = require("./src/middleware/404");
const createSocketConnection = require("./src/websocket/websocket");
const PORT = require("./src/config/server.config");
const DBURL = require("./src/config/mongo.config");
const sessionConfig = require("./src/config/session.config");

const app = express();
const server = http.Server(app);
const io = socketIO(server);
createSocketConnection(io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "src/public")));

app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());

app.use("/api", usersRoutes);
app.use("/api/advertisement", advertisementRoutes);
app.use(error404);

async function start(PORT, DBURL) {
  try {
    await mongoose.connect(DBURL);
    server.listen(PORT, () => console.log(`App is listening on a port ${PORT}`));
  } catch(e) {
    console.log(e);
  }
}

start(PORT, DBURL);