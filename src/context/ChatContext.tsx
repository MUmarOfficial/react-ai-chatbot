import { createContext, useContext, useState, type ReactNode, useCallback, useMemo, useEffect, useRef } from "react";
import LZString from "lz-string";
import { DataConsentModal } from "../components/DataConsentModal";
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

const getUpdatedSession = (session: ChatSession, newMessages: Message[]): ChatSession => {
    if (session.messages.length === 0 && newMessages.length > 0 && session.title === "New Chat") {
        const firstUserMsg = newMessages.find(m => m.role === "user");
        if (firstUserMsg) {
            const title = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? "..." : "");
            return { ...session, messages: newMessages, title };
        }
    }
    return { ...session, messages: newMessages };
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [hasConsented, setHasConsented] = useState<boolean | null>(null);

    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [currentModel, setCurrentModel] = useState<string>("Llama 3.3 (Groq)");

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

    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current) return;

        const storedConsent = localStorage.getItem("chat_consent");
        const loadSessions = () => {
            const saved = localStorage.getItem("chat_sessions");
            if (saved) {
                try {
                    const decompressed = LZString.decompressFromUTF16(saved);
                    const parsed = decompressed ? JSON.parse(decompressed) : [];
                    setSessions(parsed);
                    if (parsed.length > 0) {
                        setCurrentSessionId(parsed[0].id);
                        setMessages(parsed[0].messages);
                    } else {
                        createNewChat();
                    }
                } catch (e) {
                    console.error("Failed to load sessions", e);
                    createNewChat();
                }
            } else {
                createNewChat();
            }
        };

        if (storedConsent === "true") {
            setHasConsented(true);
            loadSessions();
        } else if (storedConsent === "false") {
            setHasConsented(false);
            createNewChat();
        } else {
            setHasConsented(null);
            createNewChat();
        }

        isInitialized.current = true;
    }, [createNewChat]);


    useEffect(() => {
        if (hasConsented === true && sessions.length > 0) {
            const compressed = LZString.compressToUTF16(JSON.stringify(sessions));
            localStorage.setItem("chat_sessions", compressed);
        }
    }, [sessions, hasConsented]);

    const handleConsent = (consent: boolean) => {
        setHasConsented(consent);
        localStorage.setItem("chat_consent", String(consent));

        if (consent) {
            const compressed = LZString.compressToUTF16(JSON.stringify(sessions));
            localStorage.setItem("chat_sessions", compressed);
        } else {
            localStorage.removeItem("chat_sessions");
        }
    };

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

    const updateSessionStorage = useCallback((sessionId: string, newMessages: Message[]) => {
        setSessions(prev => prev.map(session =>
            session.id === sessionId ? getUpdatedSession(session, newMessages) : session
        ));
    }, []);

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
    }, [currentModel, currentSessionId, messages, updateSessionStorage]);

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
            {hasConsented === null && <DataConsentModal onConsent={handleConsent} />}
        </ChatContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within a ChatProvider");
    return context;
};