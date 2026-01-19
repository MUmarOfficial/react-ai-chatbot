import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Chat from "./Chat";

// Mock dependencies to avoid testing external libraries
vi.mock("react-syntax-highlighter", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Prism: ({ children }: any) => <pre data-testid="syntax-highlighter">{children}</pre>,
}));

vi.mock("react-markdown", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ children }: any) => <div data-testid="markdown-content">{children}</div>,
}));

vi.mock("../../context/ThemeContext", () => ({
    useTheme: () => ({ theme: "dark" }),
}));

vi.mock("lucide-react", () => ({
    User: () => <span data-testid="user-icon">User</span>,
    Sparkles: () => <span data-testid="ai-icon">AI</span>,
    Copy: () => <button>Copy</button>,
    Check: () => <span>Copied</span>,
}));

describe("Chat Component", () => {
    it("should render user message aligned correctly", () => {
        render(<Chat role="user" content="Hello World" />);

        expect(screen.getByTestId("user-icon")).toBeInTheDocument();

        expect(screen.getByTestId("markdown-content")).toHaveTextContent("Hello World");
    });

    it("should render AI assistant message", () => {
        render(<Chat role="assistant" content="I am AI" />);

        expect(screen.getByTestId("ai-icon")).toBeInTheDocument();
        expect(screen.getByTestId("markdown-content")).toHaveTextContent("I am AI");
    });
});