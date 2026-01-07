import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import { GoogleAiAssistant } from "../assistants/googleAi";

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

    const assistant = useMemo(() => new GoogleAiAssistant(), []);

    const addMessage = useCallback(async (content: string) => {
        const userMsg: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMsg]);

        setIsTyping(true);

        try {
            const responseText = await assistant.chat(content);

            const aiMsg: Message = { role: "assistant", content: responseText };
            setMessages((prev) => [...prev, aiMsg]);
        } catch (error) {
            console.error("ChatContext Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "⚠️ Sorry, I encountered an error." }
            ]);
        } finally {
            setIsTyping(false);
        }
    }, [assistant, messages]);

    const value = useMemo(() => ({
        messages,
        addMessage,
        isTyping
    }), [messages, addMessage, isTyping]);

    return (
        <ChatContext.Provider value={value}>
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