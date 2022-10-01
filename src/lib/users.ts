import { getRoom } from "./rooms";

const users: User[] = [];

export function addUser(id: string, username: string) {
  const newUser: User = { id, username, typing: false };
  users.push(newUser);
  return newUser;
}

export function updateUserSocket(userId: string, socketId: string | null) {
  const user = getUser(userId);
  if (!user) return;
  user.socketId = socketId;
  return user;
}

export function userJoinRoom(userId: string, roomId: string) {
  const user = getUser(userId);
  const room = getRoom(roomId);
  if (!room || !user) return;
  user.roomId = room.id;
  return room.id;
}

export function userLeaveRoom(id: string) {
  const user = getUser(id);
  if (!user) return;
  user.roomId = null;
  return user;
}

export function getAllUsers() {
  return users;
}

export function getUser(id: string) {
  return users.find((user) => user.id === id);
}

export function getUsersByRoom(roomId: string) {
  return users.filter((user) => user.roomId === roomId);
}

export function removeUser(id: string) {
  const idx = users.findIndex((user) => user.id === id);
  const removedUser = users[idx];
  if (idx < 0) return;
  users.splice(idx, 1);
  return removedUser;
}

export function getUsersTyping() {
  let typing = false;
  for (let i = 0; i < users.length; i++) {
    if (users[i].typing) {
      typing = true;
      break;
    }
  }
  return typing;
}

export function getUsersTypingByRoom(room: string) {
  const roomUsers = getUsersByRoom(room);
  let typing = false;
  for (let i = 0; i < roomUsers.length; i++) {
    if (roomUsers[i].typing) {
      typing = true;
      break;
    }
  }
  return typing;
}

export function setUserTyping(id: string, status: boolean) {
  const user = getUser(id);
  if (!user) return;
  user.typing = status;
}
