import ChatContainer from "./components/ChatContainer";
import Header from "./components/Header";
import Controls from "./components/controls/Controls";
import { ChatProvider } from "./context/ChatContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <div className="relative flex flex-col h-dvh w-full bg-black text-white overflow-hidden">
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-purple-900/10 rounded-full blur-[120px] mix-blend-screen opacity-50" />
          </div>
          <div className="relative z-10 flex flex-col h-full max-w-5xl mx-auto w-full">
            <Header />
            <main className="flex-1 flex flex-col min-h-0 relative">
              <ChatContainer />
              <Controls />
            </main>
          </div>
        </div>
      </ChatProvider>
    </ThemeProvider>
  );
};

export default App;