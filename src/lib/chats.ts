import { nanoid } from "nanoid";

const roomChats: RoomChat[] = [];
const privateChats: PrivateChat[] = [];

// room-chats
export function getRoomChat(roomId: string) {
  const roomChat = roomChats.find((chat) => chat.roomId === roomId);
  if (!roomChat) {
    const newRoomChat = { roomId, messages: [] };
    roomChats.push(newRoomChat);
    return newRoomChat;
  }
  return roomChat;
}

export function addRoomChatMessage(
  roomId: string,
  message: ClientMsg | ServerMsg
) {
  const roomChat = roomChats.find((chat) => chat.roomId === roomId);
  if (!roomChat) return;
  roomChat.messages.push(message);
}

// private-chats
export function createPrivateChat(
  userId1: string,
  userId2: string,
  message?: ClientMsg | ServerMsg
) {
  const privateChat: PrivateChat = {
    id: nanoid(),
    userIds: [userId1, userId2],
    messages: [],
  };
  if (message) privateChat.messages.push(message);
  privateChats.push(privateChat);
  return privateChat;
}

export function getPrivateChat(chatId: string) {
  const privateChat = privateChats.find((chat) => chat.id === chatId);
  return privateChat;
}

export function getPrivateChatByUsers(userId1: string, userId2: string) {
  const privateChat = privateChats.find(
    (chat) => chat.userIds.includes(userId1) && chat.userIds.includes(userId2)
  );
  if (!privateChat) {
    const newPrivateChat = createPrivateChat(userId1, userId2);
    return newPrivateChat;
  }
  return privateChat;
}

export function addPrivateChatMessage(
  userId1: string,
  userId2: string,
  message: ClientMsg | ServerMsg
) {
  let privateChat = getPrivateChatByUsers(userId1, userId2);
  if (!privateChat) {
    privateChat = createPrivateChat(userId1, userId2);
  }
  privateChat.messages.push(message);
  return privateChat;
}
