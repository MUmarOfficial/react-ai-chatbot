import type { Message } from "../context/ChatContext";

export const DUMMYMESSAGES: Message[] = [
  {
    role: "user",
    content: "Hello, how are you?",
  },
  {
    role: "assistant",
    content: "I am doing well, thank you for asking!",
  },
  {
    role: "user",
    content: "What is your purpose?",
  },
  {
    role: "assistant",
    content: "I am a large language model, trained by Google.",
  },
];

export const WELCOMEMESSAGE: Message = {
  role: "assistant",
  content: "Hey, how I can help you today?",
};