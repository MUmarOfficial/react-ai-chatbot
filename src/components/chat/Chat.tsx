import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, ghcolors } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, type ComponentPropsWithoutRef, type FC, type ReactNode } from "react";
import { User, Sparkles, Copy, Check } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";
import styles from "./Chat.module.css";

type ChatProps = {
    role: "user" | "assistant";
    content: string;
};

const extractText = (node: ReactNode): string => {
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    return "";
};

const CodeBlock = ({ language, children }: { language: string; children: string }) => {
    const { theme } = useTheme();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={styles.codeBlockContainer}>
            <div className={styles.codeHeader}>
                <span className={styles.langLabel}>
                    {language || "text"}
                </span>
                <button
                    onClick={handleCopy}
                    className={styles.copyBtn}
                >
                    {copied ? (
                        <>
                            <Check className="size-3.5 text-green-500 dark:text-green-400" />
                            <span className="text-green-500 dark:text-green-400">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="size-3.5" />
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={theme === 'dark' ? vscDarkPlus : ghcolors}
                customStyle={{
                    margin: 0,
                    padding: "1.5rem",
                    background: "transparent",
                    fontSize: "0.875rem",
                    lineHeight: "1.6",
                }}
                wrapLines={true}
                wrapLongLines={true}
            >
                {children}
            </SyntaxHighlighter>
        </div>
    );
};

const CodeRenderer = ({ className, children, ...props }: ComponentPropsWithoutRef<'code'>) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match;
    const textContent = extractText(children).replace(/\n$/, "");

    if (isInline) {
        return (
            <code className={styles.inlineCode} {...props}>
                {children}
            </code>
        );
    }

    return (
        <CodeBlock language={match?.[1] || ""}>
            {textContent}
        </CodeBlock>
    );
};

const TableRenderer = ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
    <div className={styles.tableWrapper}>
        <table className={styles.table} {...props}>
            {children}
        </table>
    </div>
);

const TheadRenderer = ({ children, ...props }: ComponentPropsWithoutRef<'thead'>) => (
    <thead className={styles.thead} {...props}>
        {children}
    </thead>
);

const ThRenderer = ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
    <th className={styles.th} {...props}>{children}</th>
);

const TdRenderer = ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
    <td className={styles.td} {...props}>
        {children}
    </td>
);

const LinkRenderer = ({ children, href, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 dark:text-blue-400 hover:underline"
        {...props}
    >
        {children}
    </a>
);

const markdownComponents = {
    code: CodeRenderer,
    table: TableRenderer,
    thead: TheadRenderer,
    th: ThRenderer,
    td: TdRenderer,
    a: LinkRenderer
};

const Chat: FC<ChatProps> = ({ role, content }) => {
    const isUser = role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`${styles.chatRow} ${isUser ? styles.chatRowUser : ''}`}
            data-testid={`chat-row-${role}`}
        >
            <div className={`${styles.avatar} ${isUser ? styles.avatarUser : styles.avatarAi}`}>
                {isUser ? <User className="size-5" /> : <Sparkles className="size-5" />}
            </div>

            <div className={`${styles.contentWrapper} ${isUser ? styles.alignEnd : styles.alignStart}`}>
                <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : styles.bubbleAi}`} data-testid="chat-bubble">
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                    >
                        {content}
                    </Markdown>
                </div>
            </div>
        </motion.div>
    );
};

export default Chat;