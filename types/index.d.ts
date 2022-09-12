type NewUserMsg = {
  name: string;
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

type User = {
  id: string;
  name: string;
  typing: boolean;
};
