import type { FC } from "react";

type ChatProps = {
    role: "user" | "assistant";
    content: string;
}

const Chat: FC<ChatProps> = ({ role, content }) => {
    const isUser = role === "user";

    return (
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`
                    max-w-[85%] sm:max-w-[75%] px-5 py-3 text-base leading-relaxed shadow-sm
                    ${isUser
                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                        : 'bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm'
                    }
                `}
            >
                {content}
            </div>
        </div>
    );
};

export default Chat;