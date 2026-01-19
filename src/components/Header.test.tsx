import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Header from "./Header";
import { useChat } from "../context/ChatContext";
import { useTheme } from "../context/ThemeContext";

vi.mock("../context/ChatContext");
vi.mock("../context/ThemeContext");

describe("Header Component", () => {
    const mockUseChat = vi.mocked(useChat);
    const mockUseTheme = vi.mocked(useTheme);

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseChat.mockReturnValue({
            currentModel: "Llama 3.3 (Groq)",
            setModel: vi.fn(),
            availableModels: ["Llama 3.3 (Groq)", "GPT 5"],
        } as unknown as ReturnType<typeof useChat>);

        mockUseTheme.mockReturnValue({
            theme: "light",
            setTheme: vi.fn(),
        });
    });

    it("toggles theme correctly", () => {
        const setThemeMock = vi.fn();
        mockUseTheme.mockReturnValue({ theme: "light", setTheme: setThemeMock });

        render(<Header />);

        const themeBtn = screen.getByRole("button", { name: /current theme: light/i });
        fireEvent.click(themeBtn);

        expect(setThemeMock).toHaveBeenCalledWith("dark");
    });

    it("changes model via dropdown", () => {
        const setModelMock = vi.fn();
        mockUseChat.mockReturnValue({
            currentModel: "Llama 3.3 (Groq)",
            setModel: setModelMock,
            availableModels: ["Llama 3.3 (Groq)", "GPT 5"],
        } as unknown as ReturnType<typeof useChat>);

        render(<Header />);

        const trigger = screen.getByText("Llama 3.3 (Groq)");
        fireEvent.click(trigger);

        const option = screen.getByText("GPT 5");
        fireEvent.click(option);

        expect(setModelMock).toHaveBeenCalledWith("GPT 5");
    });
});