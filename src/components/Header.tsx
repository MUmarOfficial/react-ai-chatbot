const Header = () => {
    return (
        <header className="shrink-0 border-b border-slate-800 bg-[#0f172a] p-4">
            <div className="flex items-center justify-center gap-3">
                <div className="size-8 rounded-lg flex items-center justify-center">
                    <img src="/chatbotLogo.png" alt="Logo" />
                </div>
                <h1 className="text-lg font-semibold text-slate-200 tracking-wide">
                    AI Chatbot
                </h1>
            </div>
        </header>
    );
};

export default Header;