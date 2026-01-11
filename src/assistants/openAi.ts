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

  constructor(model = "gpt-4o", client = openai) {
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
      console.error("OpenAI Error:", error);

      let errorMsg = "\n\n⚠️ System Error.";

      // Specific OpenAI Error Codes
      if (error?.status === 401) {
        errorMsg =
          "\n\n⚠️ **Error: Invalid OpenAI API Key.**\nPlease check your .env file.";
      } else if (
        error?.code === "insufficient_quota" ||
        error?.status === 429
      ) {
        errorMsg =
          "\n\n⚠️ **Error: OpenAI Quota Exceeded / $0 Balance.**\nPlease add funds to your OpenAI account.";
      } else if (error?.status === 500 || error?.status === 503) {
        errorMsg =
          "\n\n⚠️ **Error: OpenAI Server Issue.**\nPlease try again later.";
      } else if (error instanceof Error) {
        errorMsg += ` - ${error.message}`;
      }

      onChunk(errorMsg);
    }
  }
}
