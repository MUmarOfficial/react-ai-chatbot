import { useState } from "react";
import {
    MessageSquarePlus,
    MessageSquare,
    ChevronRight,
} from "lucide-react";
import styles from "./Sidebar.module.css";

const MOCK_HISTORY = [
    { label: "Today", items: ["React Context vs Redux", "Tailwind Grid Layout", "Fixing TypeScript Errors"] },
    { label: "Yesterday", items: ["Python Data Analysis", "Docker Compose Setup"] },
    { label: "Previous 7 Days", items: ["Next.js 14 Features", "Explain Quantum Computing", "Recipe for Lasagna"] },
];

type SidebarProps = {
    isOpen?: boolean;
    onClose?: () => void;
};

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
    const [activeId, setActiveId] = useState("React Context vs Redux");

    return (
        <>
            <button
                type="button"
                className={`${styles.overlay} ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none md:hidden'}`}
                onClick={onClose}
                aria-label="Close sidebar overlay"
            />

            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.header}>
                    {
                        innerWidth < 640 && (
                            <div className={`${styles.logoGroup}`}>
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
                        )
                    }
                    <button className={styles.newChatBtn}>
                        <MessageSquarePlus className="size-5 text-blue-500" />
                        <span className="font-medium">New Chat</span>
                    </button>
                </div>

                <div className={`${styles.scroller} custom-scrollbar`}>
                    {MOCK_HISTORY.map((section, index) => (
                        <div key={index} className={styles.fadeIn} style={{ animationDelay: `${index * 0.1}s` }}>
                            <h3 className={styles.sectionTitle}>{section.label}</h3>
                            {section.items.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => setActiveId(item)}
                                    className={`${styles.item} ${activeId === item ? styles.itemActive : ''}`}
                                >
                                    <MessageSquare className="size-4 shrink-0 opacity-70" />
                                    <span className={styles.itemText}>{item}</span>
                                    {activeId === item && (
                                        <ChevronRight className="size-3 ml-auto opacity-50" />
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;