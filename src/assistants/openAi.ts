import OpenAI from "openai";
import { type AiAssistant } from "../interfaces/ai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});

type Message = OpenAI.Chat.ChatCompletionMessageParam;

export class OpenAiAssistant implements AiAssistant {
  private readonly model: string;
  private readonly client: OpenAI;
  private readonly history: Message[] = [];

  constructor(model = "gpt-5", client = openai) {
    this.model = model;
    this.client = client;
  }

  async chatStream(
    content: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      const userMsg: Message = { role: "user", content };
      this.history.push(userMsg);

      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: this.history,
        stream: true,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          fullResponse += text;
          onChunk(text);
        }
      }

      this.history.push({ role: "assistant", content: fullResponse });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("OpenAi Error:", error);

      let errorMsg = "\n\n⚠️ System Error.";

      if (JSON.stringify(error).includes("credit balance is too low")) {
        errorMsg =
          "\n\n⚠️ **Error: OpenAi Credit Balance is $0.**\nPlease add funds or switch to the free Groq models using the dropdown.";
      } else if (error?.status === 529) {
        errorMsg =
          "\n\n⚠️ **Error: OpenAi is Overloaded.**\nOpenAi servers are busy. Please try again in a moment.";
      } else if (error?.status === 401) {
        errorMsg =
          "\n\n⚠️ **Error: Invalid API Key.**\nPlease check your .env file.";
      } else if (error instanceof Error) {
        errorMsg += ` - ${error.message}`;
      }

      onChunk(errorMsg);
    }
  }
}
