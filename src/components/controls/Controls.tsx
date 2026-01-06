import { useState, useRef, type FormEvent } from "react";
import { useChat } from "../../context/ChatContext";

const Controls = () => {
    const { addMessage, isTyping } = useChat();
    const [inputVal, setInputVal] = useState("");
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!inputVal.trim() || isTyping) return;

        addMessage(inputVal);

        setInputVal("");
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div className="p-4 bg-[#0f172a] border-t border-slate-800">
            <form
                onSubmit={handleSubmit}
                className="flex items-end gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700 focus-within:border-blue-500/50 transition-all"
            >
                <textarea
                    ref={textAreaRef}
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Message AI..."
                    rows={1}
                    disabled={isTyping}
                    className="w-full bg-transparent text-slate-100 placeholder-slate-400 px-3 py-3 min-h-[48px] max-h-[150px] resize-none outline-none disabled:opacity-50"
                    onInput={(e) => {
                        e.currentTarget.style.height = "auto";
                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                    }}
                />

                <button
                    type="submit"
                    disabled={!inputVal.trim() || isTyping}
                    className="mb-1 mr-1 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors"
                >
                    {isTyping ? (
                        <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Controls;