import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState, type FC } from "react";
import { User, Sparkles, Copy, Check } from "lucide-react";

type ChatProps = {
    role: "user" | "assistant";
    content: string;
};

const CodeBlock = ({ language, children }: { language: string; children: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e]">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    {language || "text"}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="size-3.5 text-green-400" />
                            <span className="text-green-400">Copied!</span>
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
                style={vscDarkPlus}
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CodeRenderer = ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match;

    if (isInline) {
        return (
            <code className="bg-white/10 text-rose-300 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
            </code>
        );
    }

    // Safely cast children to string for the code block
    const codeContent = String(children).replace(/\n$/, "");

    return (
        <CodeBlock language={match[1]}>
            {codeContent}
        </CodeBlock>
    );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TableRenderer = ({ children }: any) => (
    <div className="overflow-x-auto my-4 border border-white/10 rounded-lg">
        <table className="w-full text-left text-sm border-collapse">
            {children}
        </table>
    </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TheadRenderer = ({ children }: any) => (
    <thead className="bg-white/5 text-white/80 border-b border-white/10">
        {children}
    </thead>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ThRenderer = ({ children }: any) => (
    <th className="p-3 font-semibold">{children}</th>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TdRenderer = ({ children }: any) => (
    <td className="p-3 border-b border-white/5 text-white/70">
        {children}
    </td>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LinkRenderer = ({ children, href }: any) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
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
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>

            <div className={`
                shrink-0 size-8 rounded-lg flex items-center justify-center
                ${isUser ? 'bg-white/10 text-white/80' : 'bg-transparent text-blue-400'}
            `}>
                {isUser ? <User className="size-5" /> : <Sparkles className="size-5" />}
            </div>

            <div className={`flex flex-col max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`
                    py-2 px-4 rounded-2xl text-[15px] leading-7 tracking-wide w-full
                    prose prose-invert max-w-none 
                    prose-p:leading-relaxed prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-none
                    ${isUser
                        ? 'bg-white/10 text-white border border-white/5 backdrop-blur-sm'
                        : 'text-white/90'
                    }
                `}>
                    <Markdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                    >
                        {content}
                    </Markdown>
                </div>
            </div>
        </div>
    );
};

export default Chat;