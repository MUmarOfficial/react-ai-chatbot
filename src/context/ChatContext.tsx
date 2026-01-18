import { createContext, useContext, useState, type ReactNode, useCallback, useMemo, useEffect } from "react";
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

export type ChatSession = {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
};

type ChatContextType = {
    messages: Message[];
    isTyping: boolean;
    currentModel: string;
    availableModels: string[];
    sessions: ChatSession[];
    currentSessionId: string | null;
    setModel: (model: string) => void;
    addMessage: (content: string) => Promise<void>;
    createNewChat: () => void;
    switchSession: (id: string) => void;
    deleteSession: (id: string) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [sessions, setSessions] = useState<ChatSession[]>(() => {
        const saved = localStorage.getItem("chat_sessions");
        return saved ? JSON.parse(saved) : [];
    });

    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentModel, setCurrentModel] = useState<string>("Llama 3.3 (Groq)");

    useEffect(() => {
        localStorage.setItem("chat_sessions", JSON.stringify(sessions));
    }, [sessions]);

    const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

    const createNewChat = useCallback(() => {
        const newId = generateId();
        const newSession: ChatSession = {
            id: newId,
            title: "New Chat",
            messages: [],
            createdAt: Date.now(),
        };

        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
        setMessages([]);
        setIsTyping(false);
    }, []);

    useEffect(() => {
        if (currentSessionId) return;

        if (sessions.length > 0) {
            const mostRecent = sessions[0];
            setCurrentSessionId(mostRecent.id);
            setMessages(mostRecent.messages);
        } else {
            createNewChat();
        }
    }, [sessions, currentSessionId, createNewChat]);

    const switchSession = useCallback((id: string) => {
        const session = sessions.find(s => s.id === id);
        if (session) {
            setCurrentSessionId(session.id);
            setMessages(session.messages);
            setIsTyping(false);
        }
    }, [sessions]);

    const deleteSession = useCallback((id: string) => {
        setSessions(prev => {
            const newSessions = prev.filter(s => s.id !== id);

            if (id === currentSessionId) {
                setTimeout(() => {
                    if (newSessions.length > 0) {
                        setCurrentSessionId(newSessions[0].id);
                        setMessages(newSessions[0].messages);
                    } else {
                        setCurrentSessionId(null);
                        setMessages([]);
                        createNewChat();
                    }
                }, 0);
            }
            return newSessions;
        });
    }, [currentSessionId, createNewChat]);

    const updateSessionStorage = (sessionId: string, newMessages: Message[]) => {
        setSessions(prev => prev.map(session => {
            if (session.id !== sessionId) return session;

            let title = session.title;
            if (session.messages.length === 0 && newMessages.length > 0 && title === "New Chat") {
                const firstUserMsg = newMessages.find(m => m.role === "user");
                if (firstUserMsg) {
                    title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
                }
            }
            return { ...session, messages: newMessages, title };
        }));
    };

    const appendChunkToMessages = (prevMessages: Message[], chunk: string): Message[] => {
        const newMsgs = [...prevMessages];
        const lastIndex = newMsgs.length - 1;

        if (lastIndex >= 0 && newMsgs[lastIndex].role === "assistant") {
            const lastMsg = { ...newMsgs[lastIndex] };
            lastMsg.content += chunk;
            newMsgs[lastIndex] = lastMsg;
        }
        return newMsgs;
    };

    const addMessage = useCallback(async (content: string) => {
        if (!content.trim() || !currentSessionId) return;

        const userMsg: Message = { role: "user", content };
        const aiPlaceholder: Message = { role: "assistant", content: "" };
        const initialUpdate = [...messages, userMsg, aiPlaceholder];

        setMessages(initialUpdate);
        setIsTyping(true);
        updateSessionStorage(currentSessionId, initialUpdate);

        try {
            const ai = assistants[currentModel];
            if (!ai) throw new Error(`Model ${currentModel} not initialized`);

            await ai.chatStream(content, (chunk) => {
                setMessages((prev) => appendChunkToMessages(prev, chunk));
            });

            setMessages(finalMsgs => {
                updateSessionStorage(currentSessionId, finalMsgs);
                return finalMsgs;
            });

        } catch (error: unknown) {
            let errorMessage = "⚠️ An error occurred.";
            if (error instanceof Error) errorMessage = `⚠️ Error: ${error.message}`;

            setMessages(prev => {
                const newMsgs = [...prev];
                const lastIndex = newMsgs.length - 1;
                if (lastIndex >= 0) {
                    newMsgs[lastIndex] = { ...newMsgs[lastIndex], content: errorMessage };
                }
                updateSessionStorage(currentSessionId, newMsgs);
                return newMsgs;
            });
        } finally {
            setIsTyping(false);
        }
    }, [currentModel, currentSessionId, messages]);

    const value = useMemo(() => ({
        messages,
        isTyping,
        currentModel,
        availableModels: Object.keys(assistants),
        sessions,
        currentSessionId,
        setModel: setCurrentModel,
        addMessage,
        createNewChat,
        switchSession,
        deleteSession
    }), [messages, isTyping, currentModel, sessions, currentSessionId, addMessage, createNewChat, switchSession, deleteSession]);

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