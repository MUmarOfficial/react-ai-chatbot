import { useEffect, useRef } from "react";
import Chat from "./Chat";
import { useChat } from "../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";

const ChatContainer = () => {
    const { messages, isTyping } = useChat();
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isTyping]);

    return (
        <section
            ref={containerRef}
            className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth custom-scrollbar relative"
        >
            <AnimatePresence mode="popLayout">
                {messages.length === 0 ? (
                    <motion.div
                        key="hero"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex flex-col items-center justify-center z-0 pointer-events-none"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-white/5 rounded-full blur-[100px]" />
                            <h1 className="relative text-8xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-white/80 to-white/20 select-none">
                                Chatbot
                            </h1>
                        </div>
                        <p className="mt-8 text-white/40 text-lg font-light tracking-wide">
                            Ask something challenging.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-3xl mx-auto space-y-6 pb-4"
                    >
                        {messages.map((msg, index) => (
                            <Chat key={index} role={msg.role} content={msg.content} />
                        ))}

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 ml-2"
                            >
                                <div className="size-8 rounded-lg bg-transparent border border-white/10 flex items-center justify-center">
                                    <div className="size-2 bg-blue-500 rounded-full animate-pulse" />
                                </div>
                                <span className="text-white/40 text-sm font-light">Thinking...</span>
                            </motion.div>
                        )}
                        <div ref={bottomRef} className="h-1" />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default ChatContainer;