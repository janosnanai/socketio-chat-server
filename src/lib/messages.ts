import { nanoid } from "nanoid";

export function formatMessage(msg: {}) {
  return { ...msg, id: nanoid(), time: new Date().toLocaleDateString() };
}
