type NewUserMsg = {
  id: string;
  username: string;
};
type JoinRoomMsg = {
  roomId: string;
};
type CreateMsg = {
  content: string;
  author: string;
};
type ClientMsg = {
  type: number;
  content: string;
  id: string;
  author: UserCore;
  time: string;
};
type ServerMsg = {
  type: number;
  content: string;
  id: string;
  time: string;
};
type TypingRoomMsg = {
  isTyping: boolean;
};
type TypingPrivateMsg = {
  isTyping: boolean;
  targetUserId: string;
};
type SyncUsersMsg = {
  users: User[];
};
type SyncRoomsMsg = {
  rooms: Room[];
};

type User = {
  id: string;
  username: string;
  typing: boolean;
  roomId?: string | null;
  socketId?: string | null;
};
type UserCore = {
  id: string;
  username: string;
};
type Room = {
  id: string;
  name: string;
};
type RoomChat = {
  id?: string;
  roomId: string;
  messages: (ClientMsg | ServerMsg)[];
};
type PrivateChat = {
  id?: string;
  userIds: [string, string];
  messages: (ClientMsg | ServerMsg)[];
};
