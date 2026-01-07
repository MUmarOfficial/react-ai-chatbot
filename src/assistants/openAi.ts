import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPEN_AI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export class OpenAiAssistant {
  private readonly model: string;

  constructor(model = "gpt-5-nano") {
    this.model = model;
  }

  async chat(
    content: string,
    history: OpenAI.Chat.ChatCompletionMessageParam[]
  ) {
    try {
      const result = await openai.chat.completions.create({
        model: this.model,
        messages: [...history, { role: "user", content }],
      });

      return result.choices[0].message.content || "";
    } catch (error) {
      console.error("AI Open AI Assistant Error:", error);
      throw error;
    }
  }
}
