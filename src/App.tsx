import ChatContainer from "./components/ChatContainer";
import Header from "./components/Header";
import Controls from "./components/controls/Controls";
import { ChatProvider } from "./context/ChatContext";

function App() {
  return (
    <ChatProvider>
      <div className="flex flex-col h-dvh max-w-4xl mx-auto bg-[#0f172a]">
        <Header />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <ChatContainer />
          <Controls />
        </main>
      </div>
    </ChatProvider>
  );
};

export default App;