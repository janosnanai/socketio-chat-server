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
