import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

describe("ThemeContext", () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove("light", "dark");
    });

    it("provides default theme as dark if no local storage", () => {
        const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
        expect(result.current.theme).toBe("dark");
        expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("loads theme from local storage", () => {
        localStorage.setItem("theme", "light");
        const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
        expect(result.current.theme).toBe("light");
    });

    it("toggles theme and updates local storage", () => {
        const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

        act(() => {
            result.current.setTheme("light");
        });

        expect(result.current.theme).toBe("light");
        expect(localStorage.getItem("theme")).toBe("light");
        expect(document.documentElement.classList.contains("light")).toBe(true);
    });
});