import { useChat } from "../context/ChatContext";
import {
    MessageSquarePlus,
    MessageSquare,
    PanelLeftClose,
    Trash2
} from "lucide-react";
import styles from "./Sidebar.module.css";
import type { ChatSession } from "../context/ChatContext";

type SidebarProps = {
    isOpen?: boolean;
    onClose?: () => void;
};

const groupSessions = (sessions: ChatSession[]) => {
    const groups: { label: string; items: ChatSession[] }[] = [
        { label: "Today", items: [] },
        { label: "Yesterday", items: [] },
        { label: "Previous 7 Days", items: [] },
        { label: "Older", items: [] }
    ];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;
    const weekAgo = today - (86400000 * 7);

    sessions.forEach(session => {
        if (session.createdAt >= today) {
            groups[0].items.push(session);
        } else if (session.createdAt >= yesterday) {
            groups[1].items.push(session);
        } else if (session.createdAt >= weekAgo) {
            groups[2].items.push(session);
        } else {
            groups[3].items.push(session);
        }
    });

    return groups.filter(g => g.items.length > 0);
};

const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
    const {
        sessions,
        currentSessionId,
        switchSession,
        createNewChat,
        deleteSession,
        isTyping
    } = useChat();

    const groupedSessions = groupSessions(sessions);

    const handleNewChat = () => {
        if (isTyping) return;
        createNewChat();
        if (window.innerWidth < 768) {
            onClose?.();
        }
    };

    const handleSwitchSession = (id: string) => {
        if (isTyping) return;
        switchSession(id);
        if (window.innerWidth < 768) {
            onClose?.();
        }
    };

    const handleDelete = (id: string) => {
        if (isTyping) return;
        if (globalThis.confirm("Delete this chat?")) {
            deleteSession(id);
        }
    };

    return (
        <>
            <button
                type="button"
                className={`${styles.overlay} ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none md:hidden'}`}
                onClick={onClose}
                aria-label="Close sidebar overlay"
                data-testid="sidebar-overlay"
            />

            <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.header}>
                    <div className={styles.mobileLogoContainer}>
                        <div className={styles.mobileLogoWrapper}>
                            <div className={styles.logoGlow} />
                            <div className={styles.logoIcon}>
                                <img src="/chatbotLogo.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                        </div>
                        <span className={styles.logoText}>AI Chatbot</span>

                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
                            aria-label="Close sidebar"
                            data-testid="sidebar-close-btn"
                        >
                            <PanelLeftClose className="size-5" />
                        </button>
                    </div>

                    <button
                        onClick={handleNewChat}
                        disabled={isTyping}
                        className={styles.newChatBtn}
                        data-testid="new-chat-btn"
                    >
                        <MessageSquarePlus className={`size-5 ${isTyping ? 'text-gray-400' : 'text-blue-500'}`} />
                        <span className="font-medium">New Chat</span>
                    </button>
                </div>

                <div className={`${styles.scroller} custom-scrollbar`} data-testid="session-list">
                    {groupedSessions.map((section, index) => (
                        <div key={section.label} className={styles.fadeIn} style={{ animationDelay: `${index * 0.1}s` }}>
                            <h3 className={styles.sectionTitle}>{section.label}</h3>
                            {section.items.map((session) => (
                                <div key={session.id} className="relative group w-full">
                                    <button
                                        type="button"
                                        onClick={() => handleSwitchSession(session.id)}
                                        disabled={isTyping}
                                        className={`${styles.item} ${currentSessionId === session.id ? styles.itemActive : ''}`}
                                        data-testid={`session-item-${session.id}`}
                                    >
                                        <MessageSquare className="size-4 shrink-0 opacity-70" />
                                        <span className={styles.itemText}>{session.title}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(session.id);
                                        }}
                                        disabled={isTyping}
                                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all z-10 
                                            ${isTyping
                                                ? 'opacity-0 cursor-not-allowed'
                                                : 'opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 text-gray-400 focus:opacity-100'
                                            }`}
                                        aria-label={`Delete chat ${session.title}`}
                                        title="Delete Chat"
                                        data-testid={`delete-chat-${session.id}`}
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ))}

                    {sessions.length === 0 && (
                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 mt-10 opacity-70">
                            <p>No chat history.</p>
                            <p>Start a new conversation!</p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;