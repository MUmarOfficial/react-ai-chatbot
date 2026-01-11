import { createContext, useContext, useEffect, useState, type ReactNode, useMemo, useCallback } from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    resolvedTheme: "light" | "dark";
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("theme");
        return (saved as Theme) || "system";
    });

    const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
        if (typeof globalThis === "undefined" || !globalThis.matchMedia) return "dark";
        return globalThis.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    });

    useEffect(() => {
        if (typeof globalThis.matchMedia !== "function") return;

        const mediaQuery = globalThis.matchMedia("(prefers-color-scheme: dark)");

        const updateSystemTheme = () => {
            const newSystemTheme = mediaQuery.matches ? "dark" : "light";
            setSystemTheme((prev) => (prev === newSystemTheme ? prev : newSystemTheme));
            console.log("System theme detected:", newSystemTheme);
        };

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? "dark" : "light");
        };

        const handleFocus = () => updateSystemTheme();

        mediaQuery.addEventListener("change", handleChange);
        globalThis.addEventListener("focus", handleFocus);
        globalThis.addEventListener("visibilitychange", handleFocus);

        updateSystemTheme();

        return () => {
            mediaQuery.removeEventListener("change", handleChange);
            globalThis.removeEventListener("focus", handleFocus);
            globalThis.removeEventListener("visibilitychange", handleFocus);
        };
    }, []);

    const resolvedTheme = theme === "system" ? systemTheme : theme;

    useEffect(() => {
        const root = globalThis.document.documentElement;

        root.classList.remove("light", "dark");
        root.classList.add(resolvedTheme);
        root.style.colorScheme = resolvedTheme;

    }, [resolvedTheme]);

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    const handleSetTheme = useCallback((newTheme: Theme) => {
        setTheme(newTheme);
    }, []);

    const value = useMemo(() => ({
        theme,
        setTheme: handleSetTheme,
        resolvedTheme
    }), [theme, handleSetTheme, resolvedTheme]);

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