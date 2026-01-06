import type { ChatMessage } from "../App";

export const DUMMYMESSAGES: ChatMessage[] = [
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

export const WELCOMEMESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hey, how I can help you today?",
};