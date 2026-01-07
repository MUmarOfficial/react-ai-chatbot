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
    } catch (error) {
      console.error("Google AI Error:", error);
      onChunk("\n\n[System Error: Connection to Gemini failed]");
      throw error;
    }
  }
}
