import express from "express";
import { createServer } from "http";
import { nanoid } from "nanoid";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log(socket.id, "connected");

  io.emit("message", {
    msg: `Say HI to ${socket.id}!`,
    msgId: nanoid(),
    senderId: "server",
  });

  socket.on("hello", (args: any[], callback) => {
    args.forEach((arg) => {
      console.log(arg);
      callback("hello-bello");
    });
  });

  socket.on("clientMsg", (msg) => {
    io.emit("message", { msg, msgId: nanoid(), senderId: socket.id });
    console.log(`$${socket.id}: ${msg}`);
  });

  socket.on("disconnect", (reason) => {
    console.log(socket.id, reason);

    io.emit("message", {
      msg: `Bye-bye ${socket.id}.`,
      msgId: nanoid(),
      senderId: "server",
    });
  });
});

httpServer.listen(8888);
