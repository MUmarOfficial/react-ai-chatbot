import { GoogleGenAI } from "@google/genai";
import { type AiAssistant } from "../interfaces/ai";

type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

export class GoogleAiAssistant implements AiAssistant {
  private readonly ai: GoogleGenAI;
  private readonly model: string;
  private readonly history: Message[] = [];

  constructor(modelName = "gemini-2.5-flash") {
    this.ai = new GoogleGenAI({
      apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    });
    this.model = modelName;
  }

  async chatStream(
    content: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    try {
      this.history.push({ role: "user", parts: [{ text: content }] });

      const response = await this.ai.models.generateContentStream({
        model: this.model,
        contents: this.history,
      });

      let fullResponse = "";

      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
          fullResponse += text;
          onChunk(text);
        }
      }

      this.history.push({ role: "model", parts: [{ text: fullResponse }] });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Google AI Error:", error);

      let errorMsg = "\n\n⚠️ System Error.";
      const errString = error.message || JSON.stringify(error);

      if (errString.includes("401") || errString.includes("API key")) {
        errorMsg =
          "\n\n⚠️ **Error: Invalid Google API Key.**\nPlease check your .env file.";
      } else if (errString.includes("429") || errString.includes("quota")) {
        errorMsg =
          "\n\n⚠️ **Error: Gemini Rate Limit / Quota Exceeded.**\nYou are sending requests too fast or hit the free tier limit.";
      } else if (
        errString.includes("503") ||
        errString.includes("overloaded")
      ) {
        errorMsg =
          "\n\n⚠️ **Error: Gemini is Overloaded.**\nGoogle servers are busy. Please try again later.";
      } else if (error instanceof Error) {
        errorMsg += ` - ${error.message}`;
      }

      onChunk(errorMsg);
    }
  }
}
