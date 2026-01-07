import { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronDown, Check } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
    const { currentModel, setModel, availableModels } = useChat();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="shrink-0 py-4 px-6 flex items-center justify-between bg-transparent z-50">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center size-10">
                    <div className="absolute inset-0 bg-white/10 rounded-xl blur-sm" />
                    <div className="relative bg-black/50 border border-white/10 rounded-xl p-2 backdrop-blur-md">
                        <Sparkles className="size-5 text-white" />
                    </div>
                </div>
                <span className="text-xl font-medium tracking-tight text-white/90 font-sans hidden sm:block">
                    AI Chatbot
                </span>
            </div>

            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                        relative flex items-center gap-2 bg-white/5 border border-white/10 
                        rounded-full px-4 py-2 backdrop-blur-md transition-all duration-200
                        hover:bg-white/10 hover:border-white/20 active:scale-95
                        ${isOpen ? 'ring-2 ring-blue-500/20 border-white/30' : ''}
                    `}
                >
                    <span className="text-sm font-medium text-white/90 min-w-25 text-left">
                        {currentModel}
                    </span>
                    <ChevronDown
                        className={`size-4 text-white/50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute right-0 top-full mt-2 w-56 z-50 origin-top-right"
                        >
                            <div className="p-1.5 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl ring-1 ring-black/5">
                                {availableModels.map((model) => {
                                    const isActive = currentModel === model;
                                    return (
                                        <button
                                            key={model}
                                            onClick={() => {
                                                setModel(model);
                                                setIsOpen(false);
                                            }}
                                            className={`
                                                w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all
                                                ${isActive
                                                    ? 'bg-white/10 text-white font-medium shadow-[inset_0_0_10px_rgba(255,255,255,0.05)]'
                                                    : 'text-white/60 hover:text-white hover:bg-white/5'
                                                }
                                            `}
                                        >
                                            {model}
                                            {isActive && <Check className="size-4 text-blue-400" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;