type NewUserMsg = {
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
type TypingMsg = {
  isTyping: boolean;
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
