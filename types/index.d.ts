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
  author: string;
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
type Room = {
  id: string;
  name: string;
};
