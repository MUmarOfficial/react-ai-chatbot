import { GoogleGenAI } from "@google/genai";

// Define the shape of a message for the Gemini SDK
type Message = {
  role: "user" | "model";
  parts: { text: string }[];
};

export class GoogleAiAssistant {
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
      const userMessage: Message = { role: "user", parts: [{ text: content }] };
      this.history.push(userMessage);

      const response = await this.ai.models.generateContentStream({
        model: this.model,
        contents: this.history,
      });

      let fullResponseText = "";

      for await (const chunk of response) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullResponseText += chunkText;
          onChunk(chunkText);
        }
      }

      this.history.push({
        role: "model",
        parts: [{ text: fullResponseText }],
      });
    } catch (error) {
      console.error("AI Google AI Assistant Error:", error);
      throw error;
    }
  }
}
