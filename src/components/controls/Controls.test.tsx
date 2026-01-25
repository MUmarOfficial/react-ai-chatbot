import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Controls from "./Controls";

const { mockUseChat, mockUseTheme } = vi.hoisted(() => ({
    mockUseChat: vi.fn(),
    mockUseTheme: vi.fn(),
}));

vi.mock("../../context/ChatContext", () => ({
    useChat: mockUseChat,
}));

vi.mock("../../context/ThemeContext", () => ({
    useTheme: mockUseTheme,
}));

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<{ animate?: object }>) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { animate, ...rest } = props as { animate?: object };
            return <div {...rest}>{children}</div>;
        },
    },
}));

vi.mock("lucide-react", () => ({
    ArrowUp: () => <span data-testid="arrow-icon">↑</span>,
}));

describe("Controls Component", () => {
    const mockAddMessage = vi.fn();

    const defaultChatContext = {
        addMessage: mockAddMessage,
        isTyping: false,
        messages: [],
        currentModel: "Llama 3.3 (Groq)",
        availableModels: [],
        sessions: [],
        currentSessionId: null,
        setModel: vi.fn(),
        createNewChat: vi.fn(),
        switchSession: vi.fn(),
        deleteSession: vi.fn(),
    };

    const defaultThemeContext = {
        theme: "light" as const,
        setTheme: vi.fn(),
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
        it("should render the textarea input", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            expect(textarea).toBeInTheDocument();
            expect(textarea).toHaveAttribute("placeholder", "Ask anything...");
        });

        it("should render the send button", () => {
            render(<Controls />);

            const sendBtn = screen.getByTestId("send-btn");
            expect(sendBtn).toBeInTheDocument();
        });

        it("should render disclaimer text", () => {
            render(<Controls />);

            expect(screen.getByText("AI can make mistakes. Check important info.")).toBeInTheDocument();
        });
    });

    describe("Input Handling", () => {
        it("should update input value when typing", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            fireEvent.change(textarea, { target: { value: "Hello AI" } });

            expect(textarea).toHaveValue("Hello AI");
        });

        it("should clear input after form submission", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            const form = textarea.closest("form")!;

            fireEvent.change(textarea, { target: { value: "Test message" } });
            fireEvent.submit(form);

            expect(textarea).toHaveValue("");
        });

        it("should not submit empty messages", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            const form = textarea.closest("form")!;

            fireEvent.change(textarea, { target: { value: "   " } });
            fireEvent.submit(form);

            expect(mockAddMessage).not.toHaveBeenCalled();
        });
    });

    describe("Keyboard Interaction", () => {
        it("should submit message on Enter key", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            fireEvent.change(textarea, { target: { value: "Enter test" } });
            fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

            expect(mockAddMessage).toHaveBeenCalledWith("Enter test");
            expect(textarea).toHaveValue("");
        });

        it("should NOT submit on Shift+Enter (allows newline)", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            fireEvent.change(textarea, { target: { value: "Line 1" } });
            fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

            expect(mockAddMessage).not.toHaveBeenCalled();
            expect(textarea).toHaveValue("Line 1");
        });

        it("should handle other keys normally", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            fireEvent.change(textarea, { target: { value: "Test" } });
            fireEvent.keyDown(textarea, { key: "a" });

            expect(mockAddMessage).not.toHaveBeenCalled();
        });
    });

    describe("Button Submit", () => {
        it("should submit message when clicking send button", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            const sendBtn = screen.getByTestId("send-btn");

            fireEvent.change(textarea, { target: { value: "Button submit test" } });
            fireEvent.click(sendBtn);

            expect(mockAddMessage).toHaveBeenCalledWith("Button submit test");
        });

        it("should disable send button when input is empty", () => {
            render(<Controls />);

            const sendBtn = screen.getByTestId("send-btn");
            expect(sendBtn).toBeDisabled();
        });

        it("should enable send button when input has content", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            const sendBtn = screen.getByTestId("send-btn");

            fireEvent.change(textarea, { target: { value: "Some content" } });
            expect(sendBtn).not.toBeDisabled();
        });
    });

    describe("Typing State", () => {
        it("should disable textarea when AI is typing", () => {
            mockUseChat.mockReturnValue({
                ...defaultChatContext,
                isTyping: true,
            });

            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            expect(textarea).toBeDisabled();
        });

        it("should disable send button when AI is typing", () => {
            mockUseChat.mockReturnValue({
                ...defaultChatContext,
                isTyping: true,
            });

            render(<Controls />);

            const sendBtn = screen.getByTestId("send-btn");
            expect(sendBtn).toBeDisabled();
        });

        it("should not submit when AI is typing", () => {
            mockUseChat.mockReturnValue({
                ...defaultChatContext,
                isTyping: true,
            });

            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            fireEvent.change(textarea, { target: { value: "Test" } });
            fireEvent.keyDown(textarea, { key: "Enter" });

            expect(mockAddMessage).not.toHaveBeenCalled();
        });
    });

    describe("Theme Integration", () => {
        it("should render correctly in light theme", () => {
            mockUseTheme.mockReturnValue({ theme: "light", setTheme: vi.fn() });
            render(<Controls />);

            expect(screen.getByTestId("chat-input")).toBeInTheDocument();
        });

        it("should render correctly in dark theme", () => {
            mockUseTheme.mockReturnValue({ theme: "dark", setTheme: vi.fn() });
            render(<Controls />);

            expect(screen.getByTestId("chat-input")).toBeInTheDocument();
        });
    });

    describe("Focus States", () => {
        it("should handle focus and blur events", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");

            expect(() => {
                fireEvent.focus(textarea);
                fireEvent.blur(textarea);
            }).not.toThrow();
        });
    });

    describe("Form Validation", () => {
        it("should trim whitespace before checking if empty", () => {
            render(<Controls />);

            const textarea = screen.getByTestId("chat-input");
            const sendBtn = screen.getByTestId("send-btn");

            fireEvent.change(textarea, { target: { value: "   " } });
            expect(sendBtn).toBeDisabled();

            fireEvent.change(textarea, { target: { value: "  Hello  " } });
            expect(sendBtn).not.toBeDisabled();
        });
    });

    describe("Accessibility", () => {
        it("should have submit button with type submit", () => {
            render(<Controls />);

            const sendBtn = screen.getByTestId("send-btn");
            expect(sendBtn).toHaveAttribute("type", "submit");
        });
    });
});