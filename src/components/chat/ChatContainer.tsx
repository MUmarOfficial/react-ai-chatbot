import { useEffect, useRef } from "react";
import Chat from "./Chat";
import { useChat } from "../../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ChatContainer.module.css";

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
        <section ref={containerRef} className={`${styles.container} custom-scrollbar`}>
            <AnimatePresence mode="popLayout">
                {messages.length === 0 ? (
                    <motion.div
                        key="hero"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.5 }}
                        className={styles.heroContainer}
                    >
                        <div className="relative">
                            <div className={styles.heroGlow} />
                            <h1 className={styles.heroTitle}>
                                Chatbot
                            </h1>
                        </div>
                        <p className={styles.heroSubtitle}>
                            Ask something challenging.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={styles.messageList}
                    >
                        {messages.map((msg, index) => (
                            <Chat key={index} role={msg.role} content={msg.content} />
                        ))}

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={styles.typingIndicator}
                            >
                                <div className={styles.typingDot}>
                                    <div className={styles.typingPulse} />
                                </div>
                                <span className={styles.typingText}>Thinking...</span>
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