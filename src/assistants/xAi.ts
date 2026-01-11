import { createXai } from "@ai-sdk/xai";
import { streamText } from "ai";
import type { AiAssistant } from "../interfaces/ai";

const xai = createXai({
  apiKey: import.meta.env.VITE_XAI_API_KEY,
});

type CoreMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export class XAiAssistant implements AiAssistant {
  private readonly history: CoreMessage[] = [];
  private readonly model: string;

  constructor(model = "grok-4") {
    this.model = model;
  }

  async chatStream(
    content: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      this.history.push({ role: "user", content });

      const result = streamText({
        model: xai(this.model),
        messages: this.history,
      });

      let fullResponse = "";

      for await (const chunk of result.textStream) {
        fullResponse += chunk;
        onChunk(chunk);
      }

      this.history.push({ role: "assistant", content: fullResponse });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("xAI Error Log:", error);

      let errorMsg = "\n\n⚠️ **System Error**";

      const status = error?.statusCode || error?.status;
      const responseBody = error?.responseBody || "";
      const is403 = status === 403 || String(error).includes("403") || responseBody.includes("403");
      const is401 = status === 401 || String(error).includes("401");

      if (is403) {
        errorMsg = "\n\n⚠️ **Error: Access Denied (403).**\nYour xAI account has $0 credits. Please switch to the **Llama 3.3 (Groq)** model (it's free) or add funds at console.x.ai.";
      } else if (is401) {
        errorMsg = "\n\n⚠️ **Error: Invalid xAI API Key.**\nPlease check your .env file.";
      } else if (status === 402) {
        errorMsg = "\n\n⚠️ **Error: Insufficient Credits.**\nYour xAI balance is depleted.";
      } else {
        errorMsg += `: ${error?.message || "Unknown error"}`;
      }

      onChunk(errorMsg);
    }
  }
}