import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import {
  addUser,
  removeUser,
  getUsersTyping,
  setUserTyping,
} from "./lib/users";
import { formatMessage } from "./lib/messages";
import { EventTypes, MessageTypes } from "./lib/constants";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on(EventTypes.CONNECT, (socket) => {
  socket.on(EventTypes.NEW_USER, (msg: NewUserMsg) => {
    const newUser = addUser(socket.id, msg.name);
    socket.emit(
      EventTypes.SERVER_MESSAGE,
      formatMessage({
        content: `Welcome ${newUser.name}!`,
        type: MessageTypes.SERVER,
      })
    );
    socket.broadcast.emit(
      EventTypes.SERVER_MESSAGE,
      formatMessage({
        content: `${newUser.name} joined!`,
        type: MessageTypes.SERVER,
      })
    );
  });

  socket.on(EventTypes.CREATE_MESSAGE, ({ content, author }: ClientMsg) => {
    io.emit(
      EventTypes.CLIENT_MESSAGE,
      formatMessage({
        content,
        type: MessageTypes.CLIENT,
        author,
      })
    );
  });

  socket.on(EventTypes.TYPING, ({ isTyping }: TypingMsg) => {
    setUserTyping(socket.id, isTyping);
    socket.broadcast.emit(EventTypes.TYPING, { isTyping: getUsersTyping() });
  });

  socket.on(EventTypes.DISCONNECT, () => {
    const removedUser = removeUser(socket.id);
    if (!removedUser) return;
    setUserTyping(socket.id, false);
    socket.broadcast.emit(EventTypes.TYPING, { isTyping: getUsersTyping() });
    io.emit(
      EventTypes.SERVER_MESSAGE,
      formatMessage({
        content: `${removedUser.name} left...`,
        type: MessageTypes.SERVER,
      })
    );
  });
});

httpServer.listen(8888);
