export enum EventTypes {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  TYPING_ROOM = "typing:room",
  TYPING_PRIVATE = "typing:private",
  NEW_USER = "new-user",
  JOIN_ROOM = "join-room",
  LEAVE_ROOM = "leave-room",
  SYNC_USERS = "sync-users",
  SYNC_ROOMS = "sync-rooms",
  CREATE_ROOM_MESSAGE = "create-room-message",
  CREATE_PRIVATE_MESSAGE = "create-private-message",
  CLIENT_ROOM_MESSAGE = "client-room-message",
  CLIENT_PRIVATE_MESSAGE = "client-private-message",
  SERVER_MESSAGE = "server-message",
}

export enum MessageTypes {
  SERVER,
  CLIENT,
}
