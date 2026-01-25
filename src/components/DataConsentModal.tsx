import { useEffect, useState } from "react";
import styles from "./DataConsentModal.module.css";

type DataConsentModalProps = {
    onConsent: (consent: boolean) => void;
};

export const DataConsentModal = ({ onConsent }: DataConsentModalProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!isVisible) return null;

    return (
        <dialog className={styles.overlay} aria-labelledby="modal-title">
            <div className={styles.modal}>
                <h2 id="modal-title" className={styles.title}>
                    Data Storage Preference
                </h2>
                <p className={styles.description}>
                    Would you like to save your chat history in this browser?
                    If you choose <strong>No</strong>, your chats will disappear when you refresh the page.
                </p>
                <div className={styles.buttonGroup}>
                    <button
                        onClick={() => onConsent(false)}
                        className={styles.btnDecline}
                        aria-label="Decline local storage"
                    >
                        No, don't save
                    </button>
                    <button
                        onClick={() => onConsent(true)}
                        className={styles.btnAccept}
                        aria-label="Accept local storage"
                    >
                        Yes, save chats
                    </button>
                </div>
            </div>
        </dialog>
    );
};
