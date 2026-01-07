import { createContext, useContext, useEffect, useState, type ReactNode, useMemo, useCallback } from "react";

type Theme = "dark";

type ThemeContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme] = useState<Theme>("dark");

    useEffect(() => {
        const root = globalThis.document.documentElement;
        root.classList.add("dark");
    }, []);

    const toggleTheme = useCallback(() => {
        console.log("Theme is locked to Obsidian");
    }, []);

    const value = useMemo(() => ({
        theme,
        toggleTheme
    }), [theme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
};