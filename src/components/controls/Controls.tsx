import { useState, useRef, type FormEvent } from "react";
import { useChat } from "../../context/ChatContext";
import { useTheme } from "../../context/ThemeContext";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import styles from "./Controls.module.css";

const Controls = () => {
    const { addMessage, isTyping } = useChat();
    const { resolvedTheme } = useTheme();
    const [inputVal, setInputVal] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!inputVal.trim() || isTyping) return;
        addMessage(inputVal);
        setInputVal("");
        if (textAreaRef.current) textAreaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const getBorderColor = () => {
        if (resolvedTheme === 'light') {
            return isFocused ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.08)";
        }
        return isFocused ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)";
    };

    const getBgColor = () => {
        if (resolvedTheme === 'light') {
            return isFocused ? "rgba(255,255,255, 0.9)" : "rgba(255,255,255, 0.6)";
        }
        return isFocused ? "rgba(10,10,10, 0.9)" : "rgba(10,10,10, 0.6)";
    };

    return (
        <div className={styles.container}>
            <motion.div
                animate={{
                    borderColor: getBorderColor(),
                    backgroundColor: getBgColor()
                }}
                className={styles.inputWrapper}
            >
                <form onSubmit={handleSubmit} className={styles.form}>
                    <textarea
                        ref={textAreaRef}
                        value={inputVal}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onChange={(e) => setInputVal(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything..."
                        rows={1}
                        disabled={isTyping}
                        className={`${styles.textarea} custom-scrollbar`}
                        onInput={(e) => {
                            e.currentTarget.style.height = "auto";
                            e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 150)}px`;
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!inputVal.trim() || isTyping}
                        className={`${styles.submitBtn} ${inputVal.trim() && !isTyping ? styles.submitBtnActive : styles.submitBtnDisabled}`}
                    >
                        <ArrowUp className="size-5" />
                    </button>
                </form>
            </motion.div>
            <p className={styles.disclaimer}>
                AI can make mistakes. Check important info.
            </p>
        </div>
    );
};

export default Controls;