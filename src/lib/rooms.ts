import { CHAT_ROOMS } from "./constants";

const rooms = CHAT_ROOMS;

export function getAllRooms(): Room[] {
  return rooms;
}

export function getRoom(id: string | null | undefined) {
  return rooms.find((room) => room.id === id);
}
