import { useState } from "react";
import { ChatProvider } from "../../context/ChatContext";
import ChatContainer from "../chat/ChatContainer";
import Controls from "../controls/Controls";
import Header from "../Header";
import Sidebar from "../Sidebar";
import styles from "./Home.module.css";

const Home = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <ChatProvider>
            <div className={styles.appContainer}>
                <div className={styles.backgroundEffects}>
                    <div className={styles.blobBlue} />
                    <div className={styles.blobPurple} />
                </div>
                <div className={styles.contentWrapper}>
                    <Sidebar
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />
                    <main className={styles.mainArea}>
                        <Header onMenuClick={() => setIsSidebarOpen(true)} />
                        <ChatContainer />
                        <Controls />
                    </main>
                </div>
            </div>
        </ChatProvider>
    );
};

export default Home;