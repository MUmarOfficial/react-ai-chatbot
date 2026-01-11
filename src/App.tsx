import ChatContainer from "./components/ChatContainer";
import Header from "./components/Header";
import Controls from "./components/controls/Controls";
import { ChatProvider } from "./context/ChatContext";
import { ThemeProvider } from "./context/ThemeContext";
import styles from "./App.module.css";

function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <div className={styles.appContainer}>
          <div className={styles.backgroundEffects}>
            <div className={styles.blobBlue} />
            <div className={styles.blobPurple} />
          </div>
          <div className={styles.contentWrapper}>
            <Header />
            <main className={styles.mainArea}>
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