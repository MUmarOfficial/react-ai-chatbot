import Anthropic from "@anthropic-ai/sdk";
import { type AiAssistant } from "../interfaces/ai";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

type AnthropicMessage = Anthropic.Messages.MessageParam;

export class AnthropicAiAssistant implements AiAssistant {
  private readonly model: string;
  private readonly client: Anthropic;
  private readonly history: AnthropicMessage[] = [];

  constructor(model = "claude-haiku-4-5-20251001", client = anthropic) {
    this.model = model;
    this.client = client;
  }

  async chatStream(
    content: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      this.history.push({ role: "user", content });

      const stream = await this.client.messages.create({
        model: this.model,
        messages: this.history,
        max_tokens: 64000,
        stream: true,
      });

      let fullResponse = "";

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          const text = event.delta.text;
          fullResponse += text;
          onChunk(text);
        }
      }

      this.history.push({ role: "assistant", content: fullResponse });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Anthropic Error:", error);

      let errorMsg = "\n\n⚠️ System Error.";

      if (JSON.stringify(error).includes("credit balance is too low")) {
        errorMsg =
          "\n\n⚠️ **Error: Anthropic Credit Balance is $0.**\nPlease add funds at console.anthropic.com or switch to the free Groq models using the dropdown.";
      } else if (error?.status === 529) {
        errorMsg =
          "\n\n⚠️ **Error: Claude is Overloaded.**\nAnthropic servers are busy. Please try again in a moment.";
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
