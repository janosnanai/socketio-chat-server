import type { Socket } from "socket.io";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import HttpError from "./lib/http-error";
import { addRoomChatMessage, getRoomChat } from "./lib/chats";
import {
  addUser,
  removeUser,
  getAllUsers,
  getUsersTypingByRoom,
  setUserTyping,
  getUser,
} from "./lib/users";
import { getRoom, getRoomList } from "./lib/rooms";
import { formatChatMessage } from "./lib/messages";
import { EventTypes, MessageTypes } from "./lib/constants";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

app.use(cors());

// GET route for room-chat
app.get("/room-chats/:room_id", (req, res, next) => {
  const chat = getRoomChat(req.params.room_id);
  if (!chat) {
    const error = new HttpError("Cannot find chat-room.", 404);
    return next(error);
  }
  res.status(200).json(chat);
});

io.on(EventTypes.CONNECT, (socket: Socket) => {
  let thisUserId: string;
  // new user event
  socket.on(EventTypes.NEW_USER, (msg: NewUserMsg, callback: Function) => {
    thisUserId = msg.id;
    addUser(msg.id, msg.username);
    io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
    // send available rooms in ack
    callback({ rooms: getRoomList() });
  });

  // user join room event
  socket.on(
    EventTypes.JOIN_ROOM,
    ({ roomId }: JoinRoomMsg, callback: Function) => {
      const user = getUser(thisUserId);
      if (!user) return;
      const currentRoom = getRoom(user.roomId);
      const nextRoom = getRoom(roomId);
      if (!nextRoom || nextRoom === currentRoom) return;
      socket.join(nextRoom.id);
      user.roomId = nextRoom.id;
      io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
      let message = formatChatMessage({
        content: `${user.username} joined the room.`,
        type: MessageTypes.SERVER,
      });
      socket.broadcast.to(user.roomId).emit(EventTypes.SERVER_MESSAGE, message);
      addRoomChatMessage(user.roomId, message as ServerMsg);
      io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
      // ack client room change
      callback();
      // leave prev room if exists
      if (!currentRoom) return;
      socket.leave(currentRoom.id);
      socket.broadcast.to(currentRoom.id).emit(EventTypes.TYPING, {
        isTyping: getUsersTypingByRoom(currentRoom.id),
      });
      message = formatChatMessage({
        content: `${user.username} left the room.`,
        type: MessageTypes.SERVER,
      });
      io.to(currentRoom.id).emit(EventTypes.SERVER_MESSAGE, message);
      addRoomChatMessage(currentRoom.id, message as ServerMsg);
    }
  );

  // user leave room event
  socket.on(EventTypes.LEAVE_ROOM, (callback: Function) => {
    const user = getUser(thisUserId);
    if (!user) return;
    const currentRoom = getRoom(user.roomId);
    if (!currentRoom) return;
    user.roomId = null;
    io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
    socket.leave(currentRoom.id);
    socket.broadcast.to(currentRoom.id).emit(EventTypes.TYPING, {
      isTyping: getUsersTypingByRoom(currentRoom.id),
    });
    const message = formatChatMessage({
      content: `${user.username} left the room.`,
      type: MessageTypes.SERVER,
    });
    io.to(currentRoom.id).emit(EventTypes.SERVER_MESSAGE, message);
    addRoomChatMessage(currentRoom.id, message as ServerMsg);
    // ack client room leave
    callback();
  });

  // chatmessage event
  socket.on(EventTypes.CREATE_MESSAGE, ({ content, author }: ClientMsg) => {
    const user = getUser(thisUserId);
    if (!user) return;
    const room = getRoom(user.roomId);
    if (!room) return;
    const message = formatChatMessage({
      content,
      type: MessageTypes.CLIENT,
      author,
    });
    io.to(room.id).emit(EventTypes.CLIENT_MESSAGE, message);
    addRoomChatMessage(room.id, message as ClientMsg);
  });

  // user is typing event
  socket.on(EventTypes.TYPING, ({ isTyping }: TypingMsg) => {
    const user = getUser(thisUserId);
    if (!user) return;
    const room = getRoom(user.roomId);
    if (!room) return;
    setUserTyping(thisUserId, isTyping);
    socket.broadcast
      .to(room.id)
      .emit(EventTypes.TYPING, { isTyping: getUsersTypingByRoom(room.id) });
  });

  // user disconnect event
  socket.on(EventTypes.DISCONNECT, () => {
    const user = removeUser(thisUserId);
    if (!user) return;
    io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
    const currentRoom = getRoom(user.roomId);
    if (!currentRoom) return;
    setUserTyping(thisUserId, false);
    socket.broadcast.to(currentRoom.id).emit(EventTypes.TYPING, {
      isTyping: getUsersTypingByRoom(currentRoom.id),
    });
    socket.leave(currentRoom.id);
    const message = formatChatMessage({
      content: `${user.username} left the room.`,
      type: MessageTypes.SERVER,
    });
    io.to(currentRoom.id).emit(EventTypes.SERVER_MESSAGE, message);
    addRoomChatMessage(currentRoom.id, message as ServerMsg);
  });
});

httpServer.listen(8888);
