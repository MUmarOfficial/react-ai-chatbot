import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Header from "./Header";
import { ThemeProvider } from "../context/ThemeContext";
import { ChatProvider } from "../context/ChatContext";

vi.mock("../assistants/groqAi", () => ({
    GroqAiAssistant: vi.fn(),
}));

describe("Header Integration", () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.className = "";
    });

    it("should integrate with ThemeContext to toggle classes", () => {
        render(
            <ChatProvider>
                <ThemeProvider>
                    <Header />
                </ThemeProvider>
            </ChatProvider>
        );

        expect(document.documentElement.classList.contains("dark")).toBe(true);

        const themeBtn = screen.getByTitle(/Current theme:/i);
        fireEvent.click(themeBtn);

        expect(document.documentElement.classList.contains("light")).toBe(true);
    });

    it("should integrate with ChatContext to change models", () => {
        render(
            <ChatProvider>
                <ThemeProvider>
                    <Header />
                </ThemeProvider>
            </ChatProvider>
        );

        const modelSelectorTrigger = screen.getByText("Llama 3.3 (Groq)");
        fireEvent.click(modelSelectorTrigger);

        const newModelOption = screen.getByRole("button", { name: "Gemini 2.5" });
        fireEvent.click(newModelOption);

        expect(screen.getAllByText("Gemini 2.5").length).toBeGreaterThan(0);
    });
});