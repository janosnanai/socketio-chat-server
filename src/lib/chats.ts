const roomChats: RoomChat[] = [];

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
