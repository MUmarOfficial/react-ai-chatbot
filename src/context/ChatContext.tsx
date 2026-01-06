import { GoogleGenerativeAI } from "@google/generative-ai";
import { createContext, useContext, useState, type ReactNode } from "react";

const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export type Message = {
    role: "user" | "assistant";
    content: string;
};

type ChatContextType = {
    messages: Message[];
    addMessage: (content: string) => void;
    isTyping: boolean;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const addMessage = async (content: string) => {
        const userMsg: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMsg]);

        setIsTyping(true);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const result = await model.generateContent(content);
            const response = await result.response;
            const text = response.text();

            const aiMsg: Message = { role: "assistant", content: text };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("Error generating response:", error);

            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠️ Sorry, I encountered an error. Please check your API key." }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <ChatContext.Provider value={{ messages, addMessage, isTyping }}>
            {children}
        </ChatContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};