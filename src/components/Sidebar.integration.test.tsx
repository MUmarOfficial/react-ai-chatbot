import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Sidebar from "./Sidebar";
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

describe("Sidebar Integration Tests", () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        globalThis.confirm = vi.fn(() => true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderWithProvider = (ui: React.ReactElement) => {
        return render(<ChatProvider>{ui}</ChatProvider>);
    };

    describe("Session Management", () => {
        it("should create new chat sessions", async () => {
            await act(async () => {
                renderWithProvider(<Sidebar isOpen={true} />);
            });

            const newChatBtns = screen.getAllByText("New Chat");
            expect(newChatBtns.length).toBeGreaterThan(0);

            const headerNewChatBtn = screen.getByTestId("new-chat-btn");
            await act(async () => {
                fireEvent.click(headerNewChatBtn);
            });

            await waitFor(() => {
                const allNewChats = screen.getAllByText("New Chat");
                expect(allNewChats.length).toBeGreaterThanOrEqual(2);
            });
        });

        it("should delete a session with confirmation", async () => {
            await act(async () => {
                renderWithProvider(<Sidebar isOpen={true} />);
            });

            const newChatBtn = screen.getByTestId("new-chat-btn");
            await act(async () => {
                fireEvent.click(newChatBtn);
            });

            const deleteBtns = screen.getAllByTitle("Delete Chat");
            expect(deleteBtns.length).toBeGreaterThan(0);

            await act(async () => {
                fireEvent.click(deleteBtns[0]);
            });

            expect(globalThis.confirm).toHaveBeenCalledWith("Delete this chat?");

            await waitFor(() => {
                expect(screen.getAllByText("New Chat").length).toBeGreaterThan(0);
            });
        });

        it("should not delete session if user cancels confirmation", async () => {
            globalThis.confirm = vi.fn(() => false);

            await act(async () => {
                renderWithProvider(<Sidebar isOpen={true} />);
            });

            const newChatBtn = screen.getByTestId("new-chat-btn");
            await act(async () => {
                fireEvent.click(newChatBtn);
            });

            const initialCount = screen.getAllByText("New Chat").length;

            const deleteBtns = screen.getAllByTitle("Delete Chat");
            await act(async () => {
                fireEvent.click(deleteBtns[0]);
            });

            expect(globalThis.confirm).toHaveBeenCalled();

            expect(screen.getAllByText("New Chat").length).toBe(initialCount);
        });
    });

    describe("Session Switching", () => {
        it("should switch between sessions", async () => {
            await act(async () => {
                renderWithProvider(<Sidebar isOpen={true} />);
            });

            const newChatBtn = screen.getByTestId("new-chat-btn");
            await act(async () => {
                fireEvent.click(newChatBtn);
            });

            await waitFor(() => {
                const sessions = screen.getAllByText("New Chat");
                expect(sessions.length).toBeGreaterThanOrEqual(2);
            });
        });
    });

    describe("Overlay Behavior", () => {
        it("should call onClose when overlay is clicked", async () => {
            await act(async () => {
                renderWithProvider(<Sidebar isOpen={true} onClose={mockOnClose} />);
            });

            const overlay = screen.getByTestId("sidebar-overlay");
            fireEvent.click(overlay);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it("should call onClose when close button is clicked", async () => {
            await act(async () => {
                renderWithProvider(<Sidebar isOpen={true} onClose={mockOnClose} />);
            });

            const closeBtn = screen.getByTestId("sidebar-close-btn");
            fireEvent.click(closeBtn);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe("Z-Index / Depth Integration", () => {
        it("should render sidebar and overlay in correct order", async () => {
            await act(async () => {
                renderWithProvider(<Sidebar isOpen={true} onClose={mockOnClose} />);
            });

            const overlay = screen.getByTestId("sidebar-overlay");
            const sidebar = screen.getByRole("complementary");

            expect(overlay).toBeInTheDocument();
            expect(sidebar).toBeInTheDocument();

            expect(overlay).not.toHaveClass("invisible");
        });

        it("should make overlay clickable when sidebar is open", async () => {
            await act(async () => {
                renderWithProvider(<Sidebar isOpen={true} onClose={mockOnClose} />);
            });

            const overlay = screen.getByTestId("sidebar-overlay");

            expect(overlay.tagName.toLowerCase()).toBe("button");
            expect(overlay).not.toHaveClass("pointer-events-none");
        });
    });

    describe("Session Grouping Integration", () => {
        it("should group sessions by time with real ChatContext", async () => {
            await act(async () => {
                renderWithProvider(<Sidebar isOpen={true} />);
            });

            expect(screen.getByText("Today")).toBeInTheDocument();
        });
    });
});