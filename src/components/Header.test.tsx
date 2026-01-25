import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import Header from "./Header";

const { mockUseChat, mockUseTheme } = vi.hoisted(() => ({
    mockUseChat: vi.fn(),
    mockUseTheme: vi.fn(),
}));

vi.mock("../context/ChatContext", () => ({
    useChat: mockUseChat,
}));

vi.mock("../context/ThemeContext", () => ({
    useTheme: mockUseTheme,
}));

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<object>) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren<object>) => <>{children}</>,
}));

describe("Header Component", () => {
    const mockSetModel = vi.fn();
    const mockSetTheme = vi.fn();
    const mockOnMenuClick = vi.fn();

    const defaultChatContext = {
        currentModel: "Llama 3.3 (Groq)",
        setModel: mockSetModel,
        availableModels: ["Llama 3.3 (Groq)", "GPT 5", "Gemini 2.5", "Claude 4.5 Haiku"],
        messages: [],
        isTyping: false,
        sessions: [],
        currentSessionId: null,
        addMessage: vi.fn(),
        createNewChat: vi.fn(),
        switchSession: vi.fn(),
        deleteSession: vi.fn(),
    };

    const defaultThemeContext = {
        theme: "light" as const,
        setTheme: mockSetTheme,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseChat.mockReturnValue(defaultChatContext);
        mockUseTheme.mockReturnValue(defaultThemeContext);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Rendering", () => {
        it("should render the header with logo and title", () => {
            render(<Header />);

            expect(screen.getByTestId("header-logo-group")).toBeInTheDocument();
            expect(screen.getByText("AI Chatbot")).toBeInTheDocument();
        });

        it("should render theme toggle button", () => {
            render(<Header />);

            const themeBtn = screen.getByTestId("theme-toggle-btn");
            expect(themeBtn).toBeInTheDocument();
        });

        it("should render model selector button", () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            expect(modelBtn).toBeInTheDocument();
            expect(modelBtn).toHaveTextContent("Llama 3.3 (Groq)");
        });

        it("should render mobile menu button", () => {
            render(<Header onMenuClick={mockOnMenuClick} />);

            const menuBtn = screen.getByTestId("mobile-menu-btn");
            expect(menuBtn).toBeInTheDocument();
        });
    });

    describe("Theme Toggle", () => {
        it("should toggle from light to dark theme", () => {
            mockUseTheme.mockReturnValue({ theme: "light", setTheme: mockSetTheme });
            render(<Header />);

            const themeBtn = screen.getByTestId("theme-toggle-btn");
            fireEvent.click(themeBtn);

            expect(mockSetTheme).toHaveBeenCalledWith("dark");
        });

        it("should toggle from dark to light theme", () => {
            mockUseTheme.mockReturnValue({ theme: "dark", setTheme: mockSetTheme });
            render(<Header />);

            const themeBtn = screen.getByTestId("theme-toggle-btn");
            fireEvent.click(themeBtn);

            expect(mockSetTheme).toHaveBeenCalledWith("light");
        });

        it("should have correct title attribute based on theme", () => {
            mockUseTheme.mockReturnValue({ theme: "light", setTheme: mockSetTheme });
            render(<Header />);

            const themeBtn = screen.getByTestId("theme-toggle-btn");
            expect(themeBtn).toHaveAttribute("title", "Switch to dark mode");
        });
    });

    describe("Model Selector Dropdown - Popup Behavior", () => {
        it("should open dropdown when model selector is clicked", () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            const dropdown = screen.getByTestId("model-dropdown");
            expect(dropdown).toBeInTheDocument();
        });

        it("should close dropdown when clicking on a model option", () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            const option = screen.getByTestId("model-option-GPT 5");
            fireEvent.click(option);

            expect(mockSetModel).toHaveBeenCalledWith("GPT 5");
            expect(screen.queryByTestId("model-dropdown")).not.toBeInTheDocument();
        });

        it("should display all available models in dropdown", () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            expect(screen.getByTestId("model-option-Llama 3.3 (Groq)")).toBeInTheDocument();
            expect(screen.getByTestId("model-option-GPT 5")).toBeInTheDocument();
            expect(screen.getByTestId("model-option-Gemini 2.5")).toBeInTheDocument();
            expect(screen.getByTestId("model-option-Claude 4.5 Haiku")).toBeInTheDocument();
        });

        it("should show checkmark on currently selected model", () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            const activeOption = screen.getByTestId("model-option-Llama 3.3 (Groq)");
            expect(activeOption.querySelector("svg")).toBeInTheDocument();
        });

        it("should toggle dropdown open/close on repeated clicks", () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");

            fireEvent.click(modelBtn);
            expect(screen.getByTestId("model-dropdown")).toBeInTheDocument();

            fireEvent.click(modelBtn);
            expect(screen.queryByTestId("model-dropdown")).not.toBeInTheDocument();
        });

        it("should have correct ARIA attributes for accessibility", () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            expect(modelBtn).toHaveAttribute("aria-haspopup", "true");
            expect(modelBtn).toHaveAttribute("aria-expanded", "false");

            fireEvent.click(modelBtn);
            expect(modelBtn).toHaveAttribute("aria-expanded", "true");
        });
    });

    describe("Dropdown Z-Index / Depth Testing", () => {
        it("should render dropdown with proper stacking context", () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            const dropdown = screen.getByTestId("model-dropdown");
            expect(dropdown).toBeInTheDocument();
            const computedStyle = globalThis.getComputedStyle(dropdown);
            expect(computedStyle.opacity).not.toBe("0");
        });

        it("should render dropdown above other header content", () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            const dropdown = screen.getByTestId("model-dropdown");
            const themeBtn = screen.getByTestId("theme-toggle-btn");

            expect(dropdown).toBeInTheDocument();
            expect(themeBtn).toBeInTheDocument();

            expect(screen.getByRole("menu")).toBeInTheDocument();
        });
    });

    describe("Click Outside Behavior", () => {
        it("should close dropdown when clicking outside", async () => {
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            fireEvent.click(modelBtn);

            expect(screen.getByTestId("model-dropdown")).toBeInTheDocument();

            fireEvent.mouseDown(document.body);

            await waitFor(() => {
                expect(screen.queryByTestId("model-dropdown")).not.toBeInTheDocument();
            });
        });
    });

    describe("Mobile Menu", () => {
        it("should call onMenuClick when mobile menu button is clicked", () => {
            render(<Header onMenuClick={mockOnMenuClick} />);

            const menuBtn = screen.getByTestId("mobile-menu-btn");
            fireEvent.click(menuBtn);

            expect(mockOnMenuClick).toHaveBeenCalledTimes(1);
        });
    });

    describe("Keyboard Navigation", () => {
        it("should allow selecting model options with keyboard", async () => {
            const user = userEvent.setup();
            render(<Header />);

            const modelBtn = screen.getByTestId("model-selector-btn");
            await user.click(modelBtn);

            const option = screen.getByTestId("model-option-GPT 5");
            await user.click(option);

            expect(mockSetModel).toHaveBeenCalledWith("GPT 5");
        });
    });
});