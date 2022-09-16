import type { Socket } from "socket.io";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import {
  addUser,
  removeUser,
  getAllUsers,
  getUsersTypingByRoom,
  setUserTyping,
  getUser,
} from "./lib/users";
import { getAllRooms, getRoom } from "./lib/rooms";
import { formatChatMessage } from "./lib/messages";
import { EventTypes, MessageTypes } from "./lib/constants";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

io.on(EventTypes.CONNECT, (socket: Socket) => {
  // new user event
  socket.on(EventTypes.NEW_USER, (msg: NewUserMsg, callback: Function) => {
    const newUser = addUser(socket.id, msg.username);
    io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
    // send available rooms in ack
    callback({ rooms: getAllRooms() });
  });

  // user join room event
  socket.on(
    EventTypes.JOIN_ROOM,
    ({ roomId }: JoinRoomMsg, callback: Function) => {
      const user = getUser(socket.id);
      if (!user) return;
      const currentRoom = getRoom(user.roomId);
      const nextRoom = getRoom(roomId);
      if (!nextRoom || nextRoom === currentRoom) return;
      socket.join(nextRoom.id);
      user.roomId = nextRoom.id;
      io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
      socket.broadcast.to(user.roomId).emit(
        EventTypes.SERVER_MESSAGE,
        formatChatMessage({
          content: `${user.username} joined the room.`,
          type: MessageTypes.SERVER,
        })
      );
      io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
      // ack client room change
      callback();
      // leave prev room if exists
      if (!currentRoom) return;
      socket.leave(currentRoom.id);
      socket.broadcast.to(currentRoom.id).emit(EventTypes.TYPING, {
        isTyping: getUsersTypingByRoom(currentRoom.id),
      });
      io.to(currentRoom.id).emit(
        EventTypes.SERVER_MESSAGE,
        formatChatMessage({
          content: `${user.username} left the room.`,
          type: MessageTypes.SERVER,
        })
      );
    }
  );

  // user leave room event
  socket.on(EventTypes.LEAVE_ROOM, (callback: Function) => {
    const user = getUser(socket.id);
    if (!user) return;
    const currentRoom = getRoom(user.roomId);
    if (!currentRoom) return;
    user.roomId = null;
    io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
    socket.leave(currentRoom.id);
    socket.broadcast.to(currentRoom.id).emit(EventTypes.TYPING, {
      isTyping: getUsersTypingByRoom(currentRoom.id),
    });
    io.to(currentRoom.id).emit(
      EventTypes.SERVER_MESSAGE,
      formatChatMessage({
        content: `${user.username} left the room.`,
        type: MessageTypes.SERVER,
      })
    );
    // ack client room leave
    callback();
  });

  // chatmessage event
  socket.on(EventTypes.CREATE_MESSAGE, ({ content, author }: ClientMsg) => {
    const user = getUser(socket.id);
    if (!user) return;
    const room = getRoom(user.roomId);
    if (!room) return;
    io.to(room.id).emit(
      EventTypes.CLIENT_MESSAGE,
      formatChatMessage({
        content,
        type: MessageTypes.CLIENT,
        author,
      })
    );
  });

  // user is typing event
  socket.on(EventTypes.TYPING, ({ isTyping }: TypingMsg) => {
    const user = getUser(socket.id);
    if (!user) return;
    const room = getRoom(user.roomId);
    if (!room) return;
    setUserTyping(socket.id, isTyping);
    socket.broadcast
      .to(room.id)
      .emit(EventTypes.TYPING, { isTyping: getUsersTypingByRoom(room.id) });
  });

  // user disconnect event
  socket.on(EventTypes.DISCONNECT, () => {
    const user = removeUser(socket.id);
    if (!user) return;
    io.emit(EventTypes.SYNC_USERS, { users: getAllUsers() });
    const currentRoom = getRoom(user.roomId);
    if (!currentRoom) return;
    setUserTyping(socket.id, false);
    socket.broadcast.to(currentRoom.id).emit(EventTypes.TYPING, {
      isTyping: getUsersTypingByRoom(currentRoom.id),
    });
    socket.leave(currentRoom.id);
    io.to(currentRoom.id).emit(
      EventTypes.SERVER_MESSAGE,
      formatChatMessage({
        content: `${user.username} left the room.`,
        type: MessageTypes.SERVER,
      })
    );
  });
});

httpServer.listen(8888);
