import { createContext, useContext, useState, type ReactNode, useCallback, useMemo } from "react";
import { GoogleAiAssistant } from "../assistants/googleAi";

const googleAi = new GoogleAiAssistant();

type Message = {
    role: "user" | "assistant";
    content: string;
};

type ChatContextType = {
    messages: Message[];
    isTyping: boolean;
    addMessage: (content: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const addMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        setMessages((prev) => [...prev, { role: "user", content }]);
        setIsTyping(true);

        try {
            setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

            await googleAi.chatStream(content, (chunk) => {
                setMessages((prev) => {
                    const newMessages = [...prev];

                    const lastMsg = newMessages.at(-1);

                    if (lastMsg?.role === "assistant") {
                        lastMsg.content += chunk;
                    }
                    return newMessages;
                });
            });

        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Something went wrong. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    }, []);

    const contextValue = useMemo(() => ({
        messages,
        isTyping,
        addMessage
    }), [messages, isTyping, addMessage]);

    return (
        <ChatContext.Provider value={contextValue}>
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