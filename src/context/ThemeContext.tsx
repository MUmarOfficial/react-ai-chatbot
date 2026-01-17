import { createContext, useContext, useEffect, useState, type ReactNode, useMemo } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {

    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") {
            return saved;
        }
        return "dark";
    });

    useEffect(() => {
        const root = globalThis.document.documentElement;

        root.classList.remove("light", "dark");
        root.classList.add(theme);
        root.style.colorScheme = theme;
    }, [theme]);

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    const value = useMemo(() => ({
        theme,
        setTheme,
    }), [theme]);

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