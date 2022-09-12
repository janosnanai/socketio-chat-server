export enum EventTypes {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  TYPING = "typing",
  NEW_USER = "new-user",
  SYNC_USERS = "sync-users",
  CREATE_MESSAGE = "create-message",
  CLIENT_MESSAGE = "client-message",
  SERVER_MESSAGE = "server-message",
}

export enum MessageTypes {
  SERVER,
  CLIENT,
}
