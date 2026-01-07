import Markdown from "react-markdown";
import type { FC } from "react";
import { User, Sparkles } from "lucide-react";

type ChatProps = {
    role: "user" | "assistant";
    content: string;
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
            <div className={`
                flex flex-col max-w-[85%] 
                ${isUser ? 'items-end' : 'items-start'}
            `}>
                <div className={`
                    py-2 px-4 rounded-2xl text-[15px] leading-7 tracking-wide
                    ${isUser
                        ? 'bg-white/10 text-white border border-white/5 backdrop-blur-sm'
                        : 'text-white/90'
                    }
                `}>
                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                        <Markdown>{content}</Markdown>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;