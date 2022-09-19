import { nanoid } from "nanoid";

export function formatChatMessage(msg: {}) {
  return { ...msg, id: nanoid(), time: new Date().toLocaleString() };
}
