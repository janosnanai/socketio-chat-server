const users: User[] = [];

export function addUser(id: string, name: string) {
  const newUser: User = { id, name, typing: false };
  users.push(newUser);
  return newUser;
}

export function getOneUser(id: string) {
  return users.find((user) => user.id === id);
}

export function getAllUsers() {
  return users;
}

export function removeUser(id: string) {
  const idx = users.findIndex((user) => user.id === id);
  const removedUser = users[idx];
  if (idx < 0) return;
  users.splice(idx, 1);
  return removedUser;
}

export function getUsersTyping() {
  let typing = false;
  for (let i = 0; i < users.length; i++) {
    if (users[i].typing) {
      typing = true;
      break;
    }
  }
  return typing;
}

export function setUserTyping(id: string, status: boolean) {
  const user = getOneUser(id);
  if (!user) return;
  user.typing = status;
}
