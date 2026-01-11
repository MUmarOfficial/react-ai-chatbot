import { Groq } from "groq-sdk";
import { type AiAssistant } from "../interfaces/ai";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

type Message = Groq.Chat.Completions.ChatCompletionMessageParam;

export class GroqAiAssistant implements AiAssistant {
  private readonly model: string;
  private readonly history: Message[] = [];

  constructor(modelId = "llama-3.3-70b-versatile") {
    this.model = modelId;
  }

  async chatStream(
    content: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      this.history.push({ role: "user", content });

      const stream = await groq.chat.completions.create({
        model: this.model,
        messages: this.history,
        temperature: 0.6,
        max_completion_tokens: 8192,
        top_p: 0.95,
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
      console.error("Groq SDK Error:", error);

      let errorMsg = "\n\n⚠️ System Error.";

      // Groq uses standard HTTP codes
      if (error?.status === 401) {
        errorMsg =
          "\n\n⚠️ **Error: Invalid Groq API Key.**\nPlease check VITE_GROQ_API_KEY in your .env file.";
      } else if (error?.status === 429) {
        errorMsg =
          "\n\n⚠️ **Error: Groq Rate Limit Exceeded.**\nYou are sending messages too fast for the Free Tier. Please wait a moment.";
      } else if (error?.status === 503 || error?.status === 500) {
        errorMsg =
          "\n\n⚠️ **Error: Groq Service Unavailable.**\nThe model might be down temporarily.";
      } else if (error instanceof Error) {
        errorMsg += ` - ${error.message}`;
      }

      onChunk(errorMsg);
    }
  }
}
