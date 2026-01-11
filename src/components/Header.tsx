import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Sun, Moon, Monitor } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Header.module.css";

const ThemeIcon = ({ theme, resolvedTheme }: { theme: string; resolvedTheme: "light" | "dark" }) => {
    if (theme === 'system') return <Monitor className="size-5" />;
    return resolvedTheme === 'dark' ? <Moon className="size-5" /> : <Sun className="size-5" />;
};

const Header = () => {
    const { currentModel, setModel, availableModels } = useChat();
    const { theme, setTheme, resolvedTheme } = useTheme();
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

    const toggleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    return (
        <header className={styles.header}>
            <div className={styles.logoGroup}>
                <div className={styles.iconWrapper}>
                    <div className={styles.iconGlow} />
                    <div className={styles.iconContainer}>
                        <img src="/chatbotLogo.png" alt="Chatbot Logo" />
                    </div>
                </div>
                <span className={styles.title}>
                    AI Chatbot
                </span>
            </div>

            <div className={styles.controlsGroup}>
                <button onClick={toggleTheme} className={styles.themeToggle} title={`Current theme: ${theme}`}>
                    <ThemeIcon theme={theme} resolvedTheme={resolvedTheme} />
                </button>

                <div className={styles.modelSelector} ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`${styles.modelBtn} ${isOpen ? styles.modelBtnActive : ''}`}
                    >
                        <span className="text-sm font-medium min-w-25 text-left">
                            {currentModel}
                        </span>
                        <ChevronDown
                            className={`size-4 opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className={styles.dropdownMenu}
                            >
                                <div className={styles.dropdownContent}>
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
                                                    ${styles.menuItem} 
                                                    ${isActive ? styles.menuItemActive : styles.menuItemInactive}
                                                `}
                                            >
                                                {model}
                                                {isActive && <Check className="size-4 text-blue-500 dark:text-blue-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
};

export default Header;