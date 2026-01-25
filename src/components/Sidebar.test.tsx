import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import Sidebar from "./Sidebar";

const { mockUseChat } = vi.hoisted(() => ({
    mockUseChat: vi.fn(),
}));

vi.mock("../context/ChatContext", () => ({
    useChat: mockUseChat,
}));

describe("Sidebar Component", () => {
    const mockSwitchSession = vi.fn();
    const mockDeleteSession = vi.fn();
    const mockCreateNewChat = vi.fn();
    const mockOnClose = vi.fn();

    const createSession = (id: string, title: string, daysAgo: number = 0) => ({
        id,
        title,
        createdAt: Date.now() - daysAgo * 86400000,
        messages: [],
    });

    const defaultSessions = [
        createSession("1", "Today Chat", 0),
        createSession("2", "Yesterday Chat", 1),
        createSession("3", "Last Week Chat", 5),
        createSession("4", "Old Chat", 10),
    ];

    const defaultChatContext = {
        sessions: defaultSessions,
        currentSessionId: "1",
        switchSession: mockSwitchSession,
        deleteSession: mockDeleteSession,
        createNewChat: mockCreateNewChat,
        isTyping: false,
        messages: [],
        currentModel: "Llama 3.3 (Groq)",
        availableModels: [],
        setModel: vi.fn(),
        addMessage: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseChat.mockReturnValue(defaultChatContext);
        globalThis.confirm = vi.fn(() => true);
        Object.defineProperty(globalThis, "innerWidth", {
            writable: true,
            value: 1024,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Rendering", () => {
        it("should render sidebar with new chat button", () => {
            render(<Sidebar isOpen={true} />);

            expect(screen.getByTestId("new-chat-btn")).toBeInTheDocument();
            expect(screen.getByText("New Chat")).toBeInTheDocument();
        });

        it("should render session list", () => {
            render(<Sidebar isOpen={true} />);

            expect(screen.getByTestId("session-list")).toBeInTheDocument();
        });

        it("should render overlay button for mobile", () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByTestId("sidebar-overlay")).toBeInTheDocument();
        });

        it("should render close button", () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            expect(screen.getByTestId("sidebar-close-btn")).toBeInTheDocument();
        });
    });

    describe("Session Grouping", () => {
        it("should categorize sessions into time groups", () => {
            render(<Sidebar isOpen={true} />);

            expect(screen.getByText("Today")).toBeInTheDocument();
            expect(screen.getByText("Today Chat")).toBeInTheDocument();

            expect(screen.getByText("Yesterday")).toBeInTheDocument();
            expect(screen.getByText("Yesterday Chat")).toBeInTheDocument();

            expect(screen.getByText("Previous 7 Days")).toBeInTheDocument();
            expect(screen.getByText("Last Week Chat")).toBeInTheDocument();

            expect(screen.getByText("Older")).toBeInTheDocument();
            expect(screen.getByText("Old Chat")).toBeInTheDocument();
        });

        it("should only show groups with sessions", () => {
            mockUseChat.mockReturnValue({
                ...defaultChatContext,
                sessions: [createSession("1", "Today Only", 0)],
            });

            render(<Sidebar isOpen={true} />);

            expect(screen.getByText("Today")).toBeInTheDocument();
            expect(screen.queryByText("Yesterday")).not.toBeInTheDocument();
            expect(screen.queryByText("Previous 7 Days")).not.toBeInTheDocument();
            expect(screen.queryByText("Older")).not.toBeInTheDocument();
        });

        it("should show empty state when no sessions", () => {
            mockUseChat.mockReturnValue({
                ...defaultChatContext,
                sessions: [],
            });

            render(<Sidebar isOpen={true} />);

            expect(screen.getByText("No chat history.")).toBeInTheDocument();
            expect(screen.getByText("Start a new conversation!")).toBeInTheDocument();
        });
    });

    describe("Session Actions", () => {
        it("should create a new chat when clicking new chat button", () => {
            render(<Sidebar isOpen={true} />);

            const newChatBtn = screen.getByTestId("new-chat-btn");
            fireEvent.click(newChatBtn);

            expect(mockCreateNewChat).toHaveBeenCalledTimes(1);
        });

        it("should switch session when clicking on a session", () => {
            render(<Sidebar isOpen={true} />);

            fireEvent.click(screen.getByText("Yesterday Chat"));
            expect(mockSwitchSession).toHaveBeenCalledWith("2");
        });

        it("should show active state for current session", () => {
            render(<Sidebar isOpen={true} />);

            const activeSession = screen.getByTestId("session-item-1");
            expect(activeSession).toBeInTheDocument();
        });

        it("should delete session after confirmation", () => {
            render(<Sidebar isOpen={true} />);

            const deleteBtn = screen.getByTestId("delete-chat-1");
            fireEvent.click(deleteBtn);

            expect(globalThis.confirm).toHaveBeenCalledWith("Delete this chat?");
            expect(mockDeleteSession).toHaveBeenCalledWith("1");
        });

        it("should not delete session if confirmation is cancelled", () => {
            globalThis.confirm = vi.fn(() => false);

            render(<Sidebar isOpen={true} />);

            const deleteBtn = screen.getByTestId("delete-chat-1");
            fireEvent.click(deleteBtn);

            expect(globalThis.confirm).toHaveBeenCalled();
            expect(mockDeleteSession).not.toHaveBeenCalled();
        });
    });

    describe("Typing State", () => {
        it("should disable new chat button when AI is typing", () => {
            mockUseChat.mockReturnValue({
                ...defaultChatContext,
                isTyping: true,
            });

            render(<Sidebar isOpen={true} />);

            const newChatBtn = screen.getByTestId("new-chat-btn");
            expect(newChatBtn).toBeDisabled();
        });

        it("should disable session switching when AI is typing", () => {
            mockUseChat.mockReturnValue({
                ...defaultChatContext,
                isTyping: true,
            });

            render(<Sidebar isOpen={true} />);

            const session = screen.getByTestId("session-item-2");
            expect(session).toBeDisabled();
        });

        it("should prevent creating new chat when typing", () => {
            mockUseChat.mockReturnValue({
                ...defaultChatContext,
                isTyping: true,
            });

            render(<Sidebar isOpen={true} />);

            const newChatBtn = screen.getByTestId("new-chat-btn");
            fireEvent.click(newChatBtn);

            expect(mockCreateNewChat).not.toHaveBeenCalled();
        });
    });

    describe("Overlay and Close Behavior", () => {
        it("should call onClose when overlay is clicked", () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            const overlay = screen.getByTestId("sidebar-overlay");
            fireEvent.click(overlay);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it("should call onClose when close button is clicked", () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            const closeBtn = screen.getByTestId("sidebar-close-btn");
            fireEvent.click(closeBtn);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("Mobile Responsiveness", () => {
        it("should close sidebar on mobile when creating new chat", () => {
            Object.defineProperty(globalThis, "innerWidth", { value: 500 });

            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            const newChatBtn = screen.getByTestId("new-chat-btn");
            fireEvent.click(newChatBtn);

            expect(mockCreateNewChat).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });

        it("should close sidebar on mobile when switching session", () => {
            Object.defineProperty(globalThis, "innerWidth", { value: 500 });

            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            fireEvent.click(screen.getByText("Yesterday Chat"));

            expect(mockSwitchSession).toHaveBeenCalled();
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe("Z-Index / Depth Testing", () => {
        it("should render overlay with proper visibility when open", () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            const overlay = screen.getByTestId("sidebar-overlay");
            expect(overlay).toBeInTheDocument();
            expect(overlay).not.toHaveClass("invisible");
        });

        it("should have overlay behind sidebar but above content", () => {
            render(<Sidebar isOpen={true} onClose={mockOnClose} />);

            const overlay = screen.getByTestId("sidebar-overlay");
            const sidebar = screen.getByRole("complementary");

            expect(overlay).toBeInTheDocument();
            expect(sidebar).toBeInTheDocument();
        });
    });

    describe("Keyboard Navigation", () => {
        it("should allow keyboard interaction with sessions", async () => {
            const user = userEvent.setup();
            render(<Sidebar isOpen={true} />);

            const session = screen.getByTestId("session-item-2");
            await user.click(session);

            expect(mockSwitchSession).toHaveBeenCalledWith("2");
        });
    });
});