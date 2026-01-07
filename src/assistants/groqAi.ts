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
    } catch (error) {
      console.error("Groq SDK Error:", error);
      onChunk("\n\n[System Error: Connection to Groq failed]");
      throw error;
    }
  }
}
