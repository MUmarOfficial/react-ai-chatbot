import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";
import type { ReactNode } from "react";

describe("ThemeContext", () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.style.colorScheme = "";
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
        <ThemeProvider>{children}</ThemeProvider>
    );

    describe("Default Theme", () => {
        it("should provide default theme as dark if no localStorage", () => {
            const { result } = renderHook(() => useTheme(), { wrapper });

            expect(result.current.theme).toBe("dark");
        });

        it("should apply dark class to document element by default", () => {
            renderHook(() => useTheme(), { wrapper });

            expect(document.documentElement.classList.contains("dark")).toBe(true);
            expect(document.documentElement.classList.contains("light")).toBe(false);
        });

        it("should set colorScheme to dark by default", () => {
            renderHook(() => useTheme(), { wrapper });

            expect(document.documentElement.style.colorScheme).toBe("dark");
        });
    });

    describe("Loading from localStorage", () => {
        it("should load light theme from localStorage", () => {
            localStorage.setItem("theme", "light");

            const { result } = renderHook(() => useTheme(), { wrapper });

            expect(result.current.theme).toBe("light");
            expect(document.documentElement.classList.contains("light")).toBe(true);
        });

        it("should load dark theme from localStorage", () => {
            localStorage.setItem("theme", "dark");

            const { result } = renderHook(() => useTheme(), { wrapper });

            expect(result.current.theme).toBe("dark");
            expect(document.documentElement.classList.contains("dark")).toBe(true);
        });

        it("should fallback to dark for invalid localStorage value", () => {
            localStorage.setItem("theme", "invalid-theme");

            const { result } = renderHook(() => useTheme(), { wrapper });

            expect(result.current.theme).toBe("dark");
        });
    });

    describe("Theme Toggle", () => {
        it("should toggle from dark to light", () => {
            const { result } = renderHook(() => useTheme(), { wrapper });

            expect(result.current.theme).toBe("dark");

            act(() => {
                result.current.setTheme("light");
            });

            expect(result.current.theme).toBe("light");
            expect(document.documentElement.classList.contains("light")).toBe(true);
            expect(document.documentElement.classList.contains("dark")).toBe(false);
        });

        it("should toggle from light to dark", () => {
            localStorage.setItem("theme", "light");
            const { result } = renderHook(() => useTheme(), { wrapper });

            expect(result.current.theme).toBe("light");

            act(() => {
                result.current.setTheme("dark");
            });

            expect(result.current.theme).toBe("dark");
            expect(document.documentElement.classList.contains("dark")).toBe(true);
        });

        it("should update localStorage when theme changes", () => {
            const { result } = renderHook(() => useTheme(), { wrapper });

            act(() => {
                result.current.setTheme("light");
            });

            expect(localStorage.getItem("theme")).toBe("light");

            act(() => {
                result.current.setTheme("dark");
            });

            expect(localStorage.getItem("theme")).toBe("dark");
        });

        it("should update colorScheme when theme changes", () => {
            const { result } = renderHook(() => useTheme(), { wrapper });

            act(() => {
                result.current.setTheme("light");
            });

            expect(document.documentElement.style.colorScheme).toBe("light");
        });
    });

    describe("DOM Class Management", () => {
        it("should remove previous theme class before adding new one", () => {
            const { result } = renderHook(() => useTheme(), { wrapper });

            expect(document.documentElement.classList.contains("dark")).toBe(true);
            expect(document.documentElement.classList.contains("light")).toBe(false);

            act(() => {
                result.current.setTheme("light");
            });

            expect(document.documentElement.classList.contains("light")).toBe(true);
            expect(document.documentElement.classList.contains("dark")).toBe(false);

            act(() => {
                result.current.setTheme("dark");
            });

            expect(document.documentElement.classList.contains("dark")).toBe(true);
            expect(document.documentElement.classList.contains("light")).toBe(false);
        });
    });

    describe("Error Handling", () => {
        const useThemeWithoutProvider = () => useTheme();

        it("should throw error when useTheme is used outside ThemeProvider", () => {
            expect(() => {
                renderHook(useThemeWithoutProvider);
            }).toThrow("useTheme must be used within a ThemeProvider");
        });
    });

    describe("Memoization", () => {
        it("should return stable context value when theme does not change", () => {
            const { result, rerender } = renderHook(() => useTheme(), { wrapper });

            const firstValue = result.current;
            rerender();
            const secondValue = result.current;

            expect(firstValue.setTheme).toBe(secondValue.setTheme);
        });
    });
});