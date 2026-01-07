import {
  GoogleGenerativeAI,
  GenerativeModel,
  ChatSession,
} from "@google/generative-ai";

export class GoogleAiAssistant {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private readonly chatSession: ChatSession;

  constructor(modelName = "gemini-2.5-flash") {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "";
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    this.chatSession = this.model.startChat({
      history: [],
    });
  }

  async chat(content: string): Promise<string> {
    try {
      const result = await this.chatSession.sendMessage(content);
      return result.response.text();
    } catch (error) {
      console.error("AI Google AI Assistant Error:", error);
      throw error;
    }
  }
}
