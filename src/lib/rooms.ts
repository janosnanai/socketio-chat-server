// for simplicity index 0 will be default
const rooms: Room[] = [
  { id: "1", name: "Chill Zone" },
  { id: "2", name: "Rick & Morty Fans" },
  { id: "3", name: "Apex Legends LFG" },
  { id: "4", name: "FFD Printing QA" },
];

export function getAllRooms(): Room[] {
  return rooms;
}

export function getRoomList(): Room[] {
  return rooms.map((room) => ({ id: room.id, name: room.name }));
}

export function getRoom(id: string | null | undefined) {
  return rooms.find((room) => room.id === id);
}
