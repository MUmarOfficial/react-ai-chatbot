import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Sun, Moon, Menu } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Header.module.css";

type HeaderProps = {
    onMenuClick?: () => void;
};

const ThemeIcon = ({ theme }: { theme: "light" | "dark" }) => {
    return theme === 'dark' ? <Moon className="size-5" /> : <Sun className="size-5" />;
};

const Header = ({ onMenuClick }: HeaderProps) => {
    const { currentModel, setModel, availableModels } = useChat();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const toggleTheme = useCallback(() => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    }, [theme, setTheme]);

    return (
        <header className={styles.header}>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    aria-label="Open menu"
                    data-testid="mobile-menu-btn"
                >
                    <Menu className="size-6" />
                </button>

                <div className={styles.logoGroup} data-testid="header-logo-group">
                    <div className={styles.iconWrapper}>
                        <div className={styles.iconGlow} />
                        <div className={styles.iconContainer}>
                            <img src="/chatbotLogo.png" alt="Chatbot Logo" />
                        </div>
                    </div>
                    <span className={styles.title}>AI Chatbot</span>
                </div>
            </div>

            <div className={styles.controlsGroup}>
                <button
                    onClick={toggleTheme}
                    className={styles.themeToggle}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    data-testid="theme-toggle-btn"
                >
                    <ThemeIcon theme={theme} />
                </button>

                <div className={styles.modelSelector} ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-haspopup="true"
                        aria-expanded={isOpen}
                        aria-controls="model-dropdown-list"
                        className={`${styles.modelBtn} ${isOpen ? styles.modelBtnActive : ''}`}
                        data-testid="model-selector-btn"
                    >
                        <span className="text-sm font-medium min-w-25 text-left truncate max-w-25 sm:max-w-none">
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
                                transition={{ duration: 0.1 }}
                                className={styles.dropdownMenu}
                                data-testid="model-dropdown"
                            >
                                <div
                                    id="model-dropdown-list"
                                    className={styles.dropdownContent}
                                    role="menu"
                                >
                                    {availableModels.map((model) => {
                                        const isActive = currentModel === model;
                                        return (
                                            <button
                                                key={model}
                                                type="button"
                                                role="menuitem"
                                                data-testid={`model-option-${model}`}
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