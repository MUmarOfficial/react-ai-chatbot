import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Header from "./Header";
import { ThemeProvider } from "../context/ThemeContext";
import { ChatProvider } from "../context/ChatContext";

const { mockAssistants } = vi.hoisted(() => ({
    mockAssistants: {
        groq: { chatStream: vi.fn() },
        openai: { chatStream: vi.fn() },
        google: { chatStream: vi.fn() },
        anthropic: { chatStream: vi.fn() },
        xai: { chatStream: vi.fn() },
    },
}));

vi.mock("../assistants/groqAi", () => ({
    GroqAiAssistant: vi.fn(function () { return mockAssistants.groq; }),
}));
vi.mock("../assistants/openAi", () => ({
    OpenAiAssistant: vi.fn(function () { return mockAssistants.openai; }),
}));
vi.mock("../assistants/googleAi", () => ({
    GoogleAiAssistant: vi.fn(function () { return mockAssistants.google; }),
}));
vi.mock("../assistants/anthropicAi", () => ({
    AnthropicAiAssistant: vi.fn(function () { return mockAssistants.anthropic; }),
}));
vi.mock("../assistants/xAi", () => ({
    XAiAssistant: vi.fn(function () { return mockAssistants.xai; }),
}));

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<object>) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren<object>) => <>{children}</>,
}));

describe("Header Integration Tests", () => {
    beforeEach(() => {
        localStorage.clear();
        document.documentElement.className = "";
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <ChatProvider>
                <ThemeProvider>
                    {ui}
                </ThemeProvider>
            </ChatProvider>
        );
    };

    describe("Theme Integration", () => {
        it("should integrate with ThemeContext to toggle theme classes", async () => {
            renderWithProviders(<Header />);

            expect(document.documentElement.classList.contains("dark")).toBe(true);

            const themeBtn = screen.getByTestId("theme-toggle-btn");
            fireEvent.click(themeBtn);

            await waitFor(() => {
                expect(document.documentElement.classList.contains("light")).toBe(true);
                expect(document.documentElement.classList.contains("dark")).toBe(false);
            });
        });

        it("should persist theme changes to localStorage", async () => {
            renderWithProviders(<Header />);

            const themeBtn = screen.getByTestId("theme-toggle-btn");
            fireEvent.click(themeBtn);

            await waitFor(() => {
                expect(localStorage.getItem("theme")).toBe("light");
            });
        });

        it("should toggle theme multiple times correctly", async () => {
            renderWithProviders(<Header />);

            const themeBtn = screen.getByTestId("theme-toggle-btn");

            fireEvent.click(themeBtn);
            await waitFor(() => {
                expect(document.documentElement.classList.contains("light")).toBe(true);
            });

            fireEvent.click(themeBtn);
            await waitFor(() => {
                expect(document.documentElement.classList.contains("dark")).toBe(true);
            });
        });
    });

    describe("Model Selection Integration", () => {
        it("should integrate with ChatContext to change models", async () => {
            renderWithProviders(<Header />);

            const modelSelectorTrigger = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelSelectorTrigger);

            const newModelOption = screen.getByTestId("model-option-Gemini 2.5");
            fireEvent.click(newModelOption);

            await waitFor(() => {
                expect(screen.getByTestId("model-selector-btn")).toHaveTextContent("Gemini 2.5");
            });
        });

        it("should display all available models from ChatContext", () => {
            renderWithProviders(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            expect(screen.getByTestId("model-option-Llama 3.3 (Groq)")).toBeInTheDocument();
            expect(screen.getByTestId("model-option-GPT 5")).toBeInTheDocument();
            expect(screen.getByTestId("model-option-Gemini 2.5")).toBeInTheDocument();
            expect(screen.getByTestId("model-option-Claude 4.5 Haiku")).toBeInTheDocument();
            expect(screen.getByTestId("model-option-Grok 4")).toBeInTheDocument();
        });

        it("should show checkmark on selected model after switching", async () => {
            renderWithProviders(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            fireEvent.click(screen.getByTestId("model-option-GPT 5"));

            fireEvent.click(modelBtn);

            await waitFor(() => {
                const gpt5Option = screen.getByTestId("model-option-GPT 5");
                expect(gpt5Option.querySelector("svg")).toBeInTheDocument();
            });
        });
    });

    describe("Dropdown Popup Integration", () => {
        it("should properly open and close dropdown with real context", () => {
            renderWithProviders(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");

            expect(screen.queryByTestId("model-dropdown")).not.toBeInTheDocument();

            fireEvent.click(modelBtn);
            expect(screen.getByTestId("model-dropdown")).toBeInTheDocument();
            expect(modelBtn).toHaveAttribute("aria-expanded", "true");

            fireEvent.click(screen.getByTestId("model-option-Llama 3.3 (Groq)"));
            expect(screen.queryByTestId("model-dropdown")).not.toBeInTheDocument();
        });

        it("should close dropdown when clicking outside with real context", async () => {
            renderWithProviders(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            expect(screen.getByTestId("model-dropdown")).toBeInTheDocument();

            fireEvent.mouseDown(document.body);

            await waitFor(() => {
                expect(screen.queryByTestId("model-dropdown")).not.toBeInTheDocument();
            });
        });
    });

    describe("Z-Index / Depth Integration", () => {
        it("should render dropdown menu with proper DOM structure", () => {
            renderWithProviders(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            const dropdown = screen.getByTestId("model-dropdown");
            const menu = screen.getByRole("menu");

            expect(dropdown).toContainElement(menu);

            const menuItems = screen.getAllByRole("menuitem");
            expect(menuItems.length).toBeGreaterThan(0);
        });

        it("should keep dropdown and other elements visible when active", () => {
            renderWithProviders(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            const themeBtn = screen.getByTestId("theme-toggle-btn");

            fireEvent.click(modelBtn);
            const dropdown = screen.getByTestId("model-dropdown");

            expect(dropdown).toBeVisible();
            expect(themeBtn).toBeVisible();
        });
    });
});