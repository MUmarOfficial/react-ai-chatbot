export interface AiAssistant {
  chatStream(content: string, onChunk: (chunk: string) => void): Promise<void>;
}
