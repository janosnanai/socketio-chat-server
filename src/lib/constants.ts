export enum EventTypes {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  TYPING = "typing",
  NEW_USER = "new-user",
  JOIN_ROOM = "join-room",
  LEAVE_ROOM = "leave-room",
  SYNC_USERS = "sync-users",
  SYNC_ROOMS = "sync-rooms",
  CREATE_MESSAGE = "create-message",
  CLIENT_MESSAGE = "client-message",
  SERVER_MESSAGE = "server-message",
}

export enum MessageTypes {
  SERVER,
  CLIENT,
}


// for simplicity index 0 will be default
export const CHAT_ROOMS = [
  { id: "1", name: "Chill Zone" },
  { id: "2", name: "Rick & Morty Fans" },
  { id: "3", name: "Apex Legends LFG" },
  { id: "4", name: "FFD Printing QA" },
];
