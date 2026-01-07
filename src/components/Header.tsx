const Header = () => {
    return (
        <header className="shrink-0 py-4 px-6 flex items-center justify-between bg-transparent">
            <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative flex items-center justify-center size-10">
                    <div className="absolute inset-0 bg-white/10 rounded-xl blur-sm group-hover:blur-md transition-all duration-500" />
                    <div className="relative bg-black/50 border border-white/10 rounded-xl p-2 backdrop-blur-md">
                        <img src="/chatbotLogo.png" className="size-5 text-white" alt="logo"/>
                    </div>
                </div>
                <span className="text-xl font-medium tracking-tight text-white/90 font-sans">
                    AI Chatbot
                </span>
            </div>
        </header>
    );
};

export default Header;