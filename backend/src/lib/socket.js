import { Server } from "socket.io";
import http from "http"; //built-in
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
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
  
  // Validate userId before storing
  if (userId && typeof userId === "string" && userId.trim()) {
    userSocketMap[userId] = socket.id;
  } else {
    console.warn("Invalid userId received:", userId);
    socket.disconnect();
    return;
  }

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
