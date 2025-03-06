import { Server } from "socket.io";
import http from "http"; //built-in
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],

    credentials: true,
  },
});
//store online users
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  const userId = socket.handshake.query.userId; //sent through userAuthStore
  if (userId) userSocketMap[userId] = socket.id;

  const onlineUsers = Object.keys(userSocketMap);

  //io.event() is used to emit events to all connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  console.log("Emitting online users:", onlineUsers); //dbg

  socket.on("disconnect", () => {
    console.log(" a user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
