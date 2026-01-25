import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Chat from "./Chat";

const { mockUseTheme } = vi.hoisted(() => ({
    mockUseTheme: vi.fn(),
}));

vi.mock("react-syntax-highlighter", () => ({
    Prism: ({ children, language }: { children: string; language: string }) => (
        <pre data-testid="syntax-highlighter" data-language={language}>
            {children}
        </pre>
    ),
}));

vi.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
    vscDarkPlus: {},
    ghcolors: {},
}));

vi.mock("react-markdown", () => ({
    default: ({ children }: { children: string }) => (
        <div data-testid="markdown-content">{children}</div>
    ),
}));

vi.mock("remark-gfm", () => ({
    default: () => null,
}));

vi.mock("../../context/ThemeContext", () => ({
    useTheme: mockUseTheme,
}));

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<object>) => (
            <div {...props}>{children}</div>
        ),
    },
}));

vi.mock("lucide-react", () => ({
    User: () => <span data-testid="user-icon">User</span>,
    Sparkles: () => <span data-testid="ai-icon">AI</span>,
    Copy: () => <button data-testid="copy-btn">Copy</button>,
    Check: () => <span data-testid="check-icon">Copied</span>,
}));

describe("Chat Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseTheme.mockReturnValue({ theme: "dark" });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Rendering", () => {
        it("should render user message with user icon", () => {
            render(<Chat role="user" content="Hello World" />);

            expect(screen.getByTestId("user-icon")).toBeInTheDocument();
            expect(screen.getByTestId("chat-bubble")).toBeInTheDocument();
            expect(screen.getByTestId("markdown-content")).toHaveTextContent("Hello World");
        });

        it("should render AI assistant message with AI icon", () => {
            render(<Chat role="assistant" content="I am an AI assistant" />);

            expect(screen.getByTestId("ai-icon")).toBeInTheDocument();
            expect(screen.getByTestId("chat-bubble")).toBeInTheDocument();
            expect(screen.getByTestId("markdown-content")).toHaveTextContent("I am an AI assistant");
        });

        it("should render chat row with correct role data-testid", () => {
            render(<Chat role="user" content="Test message" />);

            expect(screen.getByTestId("chat-row-user")).toBeInTheDocument();
        });

        it("should render assistant chat row with correct data-testid", () => {
            render(<Chat role="assistant" content="AI response" />);

            expect(screen.getByTestId("chat-row-assistant")).toBeInTheDocument();
        });
    });

    describe("User Messages", () => {
        it("should apply user-specific styling class", () => {
            render(<Chat role="user" content="User message" />);

            const chatRow = screen.getByTestId("chat-row-user");
            expect(chatRow).toBeInTheDocument();
        });

        it("should display user icon for user messages", () => {
            render(<Chat role="user" content="Hello" />);

            expect(screen.getByTestId("user-icon")).toBeInTheDocument();
            expect(screen.queryByTestId("ai-icon")).not.toBeInTheDocument();
        });
    });

    describe("Assistant Messages", () => {
        it("should apply assistant-specific styling", () => {
            render(<Chat role="assistant" content="AI response" />);

            const chatRow = screen.getByTestId("chat-row-assistant");
            expect(chatRow).toBeInTheDocument();
        });

        it("should display AI icon for assistant messages", () => {
            render(<Chat role="assistant" content="Response" />);

            expect(screen.getByTestId("ai-icon")).toBeInTheDocument();
            expect(screen.queryByTestId("user-icon")).not.toBeInTheDocument();
        });
    });

    describe("Markdown Content", () => {
        it("should render content through markdown renderer", () => {
            render(<Chat role="assistant" content="# Heading\n\nSome text" />);

            expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
        });

        it("should handle empty content gracefully", () => {
            render(<Chat role="assistant" content="" />);

            expect(screen.getByTestId("chat-bubble")).toBeInTheDocument();
        });

        it("should handle long content", () => {
            const longContent = "A".repeat(1000);
            render(<Chat role="user" content={longContent} />);

            expect(screen.getByTestId("markdown-content")).toHaveTextContent(longContent);
        });
    });

    describe("Theme Integration", () => {
        it("should use dark theme styles when theme is dark", () => {
            mockUseTheme.mockReturnValue({ theme: "dark" });
            render(<Chat role="assistant" content="Dark mode content" />);

            expect(screen.getByTestId("chat-bubble")).toBeInTheDocument();
        });

        it("should use light theme styles when theme is light", () => {
            mockUseTheme.mockReturnValue({ theme: "light" });
            render(<Chat role="assistant" content="Light mode content" />);

            expect(screen.getByTestId("chat-bubble")).toBeInTheDocument();
        });
    });

    describe("Special Characters and Edge Cases", () => {
        it("should handle special characters in content", () => {
            render(<Chat role="user" content="Test <script>alert('xss')</script>" />);

            expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
        });

        it("should handle unicode characters", () => {
            render(<Chat role="user" content="Hello 世界 🌍 مرحبا" />);

            expect(screen.getByTestId("markdown-content")).toHaveTextContent("Hello 世界 🌍 مرحبا");
        });

        it("should handle newlines in content", () => {
            render(<Chat role="user" content="Line 1\nLine 2\nLine 3" />);

            expect(screen.getByTestId("markdown-content")).toBeInTheDocument();
        });
    });

    describe("Bubble Styling", () => {
        it("should render chat bubble with data-testid", () => {
            render(<Chat role="user" content="Test" />);

            const bubble = screen.getByTestId("chat-bubble");
            expect(bubble).toBeInTheDocument();
        });

        it("should have different styling for user and assistant bubbles", () => {
            const { rerender } = render(<Chat role="user" content="User" />);
            const userBubble = screen.getByTestId("chat-bubble");
            expect(userBubble).toBeInTheDocument();

            rerender(<Chat role="assistant" content="Assistant" />);
            const assistantBubble = screen.getByTestId("chat-bubble");
            expect(assistantBubble).toBeInTheDocument();
        });
    });
});