import type { Socket } from "socket.io";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import HttpError from "./lib/http-error";
import {
  addPrivateChatMessage,
  addRoomChatMessage,
  getPrivateChat,
  getPrivateChatByUsers,
  getRoomChat,
} from "./lib/chats";
import {
  addUser,
  removeUser,
  getAllUsers,
  getUsersTypingByRoom,
  setUserTyping,
  getUser,
  updateUserSocket,
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

// GET route for private-chat
app.get("/private-chats", (req, res, next) => {
  const users = req.query.user;
  const chat = getPrivateChatByUsers(...(users as [string, string]));
  res.status(200).json(chat);
});

io.on(EventTypes.CONNECT, (socket: Socket) => {
  let thisUserId: string;
  // new user event
  socket.on(EventTypes.NEW_USER, (msg: NewUserMsg, callback: Function) => {
    thisUserId = msg.id;
    addUser(msg.id, msg.username);
    updateUserSocket(thisUserId, socket.id);
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
      io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
      // ack client room change
      callback();
      // leave prev room if exists
      if (!currentRoom) return;
      socket.leave(currentRoom.id);
      socket.broadcast.to(currentRoom.id).emit(EventTypes.TYPING_ROOM, {
        isTyping: getUsersTypingByRoom(currentRoom.id),
      });
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
    socket.broadcast.to(currentRoom.id).emit(EventTypes.TYPING_ROOM, {
      isTyping: getUsersTypingByRoom(currentRoom.id),
    });
    callback();
  });

  // room chatmessage event
  socket.on(
    EventTypes.CREATE_ROOM_MESSAGE,
    ({ content, author }: ClientMsg) => {
      const user = getUser(thisUserId);
      if (!user) return;
      const room = getRoom(user.roomId);
      if (!room) return;
      const message = formatChatMessage({
        content,
        type: MessageTypes.CLIENT,
        author,
      });
      io.to(room.id).emit(EventTypes.CLIENT_ROOM_MESSAGE, message);
      addRoomChatMessage(room.id, message as ClientMsg);
    }
  );

  // private chatmessage event
  socket.on(
    EventTypes.CREATE_PRIVATE_MESSAGE,
    ({ content, author }: ClientMsg, targetUserId: string) => {
      const user1 = getUser(thisUserId);
      if (!user1) return;
      const user2 = getUser(targetUserId);
      if (!user2) return;
      const message = formatChatMessage({
        content,
        type: MessageTypes.CLIENT,
        author,
      });
      addPrivateChatMessage(thisUserId, targetUserId, message as ClientMsg);
      if (!user2.socketId) return;
      io.to(user1.socketId!)
        .to(user2.socketId)
        .emit(EventTypes.CLIENT_PRIVATE_MESSAGE, message, [
          thisUserId,
          targetUserId,
        ]);
    }
  );

  // typing to room event
  socket.on(EventTypes.TYPING_ROOM, ({ isTyping }: TypingRoomMsg) => {
    const user = getUser(thisUserId);
    if (!user) return;
    const room = getRoom(user.roomId);
    if (!room) return;
    setUserTyping(thisUserId, isTyping);
    socket.broadcast.to(room.id).emit(EventTypes.TYPING_ROOM, {
      isTyping: getUsersTypingByRoom(room.id),
    } as TypingRoomMsg);
  });

  // typing private msg event
  socket.on(
    EventTypes.TYPING_PRIVATE,
    ({ isTyping, targetUserId }: TypingPrivateMsg) => {
      const thisUser = getUser(thisUserId);
      if (!thisUser) return;
      const targetUser = getUser(targetUserId);
      if (!targetUser || !targetUser.socketId) return;
      io.to(targetUser.socketId).emit(EventTypes.TYPING_PRIVATE, {
        isTyping,
        targetUserId: thisUser.id,
      } as TypingPrivateMsg);
    }
  );

  // user disconnect event
  socket.on(EventTypes.DISCONNECT, () => {
    const user = removeUser(thisUserId);
    if (!user) return;
    io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
    const currentRoom = getRoom(user.roomId);
    if (!currentRoom) return;
    setUserTyping(thisUserId, false);
    socket.broadcast.to(currentRoom.id).emit(EventTypes.TYPING_ROOM, {
      isTyping: getUsersTypingByRoom(currentRoom.id),
    });
    socket.leave(currentRoom.id);
  });
});

httpServer.listen(8888);
