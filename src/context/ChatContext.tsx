import { createContext, useContext, useState, type ReactNode, useCallback, useMemo } from "react";
import { type AiAssistant } from "../interfaces/ai";
import { GoogleAiAssistant } from "../assistants/googleAi";
import { GroqAiAssistant } from "../assistants/groqAi";
import { AnthropicAiAssistant } from "../assistants/anthropicAi";
import { OpenAiAssistant } from "../assistants/openAi";
import { XAiAssistant } from "../assistants/xAi";


const assistants: Record<string, AiAssistant> = {
    "Llama 3.3 (Groq)": new GroqAiAssistant("llama-3.3-70b-versatile"),
    "GPT OSS (Groq)": new GroqAiAssistant("openai/gpt-oss-120b"),
    "Gemini 2.5": new GoogleAiAssistant(),
    "Claude 4.5 Haiku": new AnthropicAiAssistant(),
    "GPT 5": new OpenAiAssistant(),
    "Grok 4": new XAiAssistant(),
};

export type Message = {
    role: "user" | "assistant";
    content: string;
};

type ChatContextType = {
    messages: Message[];
    isTyping: boolean;
    currentModel: string;
    availableModels: string[];
    setModel: (model: string) => void;
    addMessage: (content: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentModel, setCurrentModel] = useState<string>("Llama 3.3 (Groq)");

    const addMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;


        setMessages((prev) => [...prev, { role: "user", content }]);
        setIsTyping(true);


        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        try {
            const ai = assistants[currentModel];
            if (!ai) throw new Error(`Model ${currentModel} not initialized`);

            await ai.chatStream(content, (chunk) => {
                setMessages((prev) => {
                    const newMessages = [...prev];

                    const lastIndex = newMessages.length - 1;

                    const lastMsg = { ...newMessages[lastIndex] };

                    if (lastMsg.role === "assistant") {
                        lastMsg.content += chunk;
                        newMessages[lastIndex] = lastMsg;
                    }

                    return newMessages;
                });
            });

        } catch (error: unknown) {
            console.error(error);
            let errorMessage = "⚠️ An error occurred.";
            if (error instanceof Error) {
                errorMessage = `⚠️ Error: ${error.message}`;
            }

            setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                const lastMsg = { ...newMessages[lastIndex] };

                if (lastMsg.role === "assistant") {
                    lastMsg.content = errorMessage;
                    newMessages[lastIndex] = lastMsg;
                }
                return newMessages;
            });
        } finally {
            setIsTyping(false);
        }
    }, [currentModel]);

    const value = useMemo(() => ({
        messages,
        isTyping,
        currentModel,
        availableModels: Object.keys(assistants),
        setModel: setCurrentModel,
        addMessage
    }), [messages, isTyping, currentModel, addMessage]);

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within a ChatProvider");
    return context;
};