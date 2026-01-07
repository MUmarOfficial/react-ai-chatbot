import { useState, useRef, type FormEvent } from "react";
import { useChat } from "../../context/ChatContext";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

const Controls = () => {
    const { addMessage, isTyping } = useChat();
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

    return (
        <div className="p-4 pb-6 shrink-0 z-20 bg-linear-to-t from-black via-black to-transparent">
            <motion.div
                animate={{
                    borderColor: isFocused ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
                    backgroundColor: isFocused ? "rgba(10,10,10, 0.9)" : "rgba(10,10,10, 0.6)"
                }}
                className="max-w-3xl mx-auto relative backdrop-blur-xl border rounded-2xl overflow-hidden transition-colors shadow-2xl"
            >
                <form onSubmit={handleSubmit} className="flex items-end p-2 pl-4 gap-2">
                    {/* <button type="button" className="p-2 mb-1 text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                        <Paperclip className="size-5" />
                    </button> */}
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
                        className="flex-1 bg-transparent text-white placeholder-white/30 py-3 max-h-37.5 resize-none outline-none text-[15px] leading-relaxed custom-scrollbar"
                        onInput={(e) => {
                            e.currentTarget.style.height = "auto";
                            e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 150)}px`;
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!inputVal.trim() || isTyping}
                        className={`mb-1 p-2 rounded-xl transition-all duration-200 shrink-0 ${inputVal.trim() && !isTyping ? 'bg-white text-black hover:bg-white/90' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                    >
                        <ArrowUp className="size-5" />
                    </button>
                </form>
            </motion.div>
            <p className="text-center text-[11px] text-white/20 mt-3 font-medium tracking-wide">
                AI can make mistakes. Check important info.
            </p>
        </div>
    );
};

export default Controls;