import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Sidebar from "./Sidebar";
import * as ChatContext from "../context/ChatContext";

vi.mock("../context/ChatContext", () => ({
    useChat: vi.fn(),
}));

describe("Sidebar Component", () => {
    const mockSwitchSession = vi.fn();
    const mockDeleteSession = vi.fn();
    const mockCreateNewChat = vi.fn();

    const sessions = [
        { id: "1", title: "Today Chat", createdAt: Date.now(), messages: [] },
        { id: "2", title: "Yesterday Chat", createdAt: Date.now() - 86400000, messages: [] },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ChatContext.useChat as any).mockReturnValue({
            sessions,
            currentSessionId: "1",
            switchSession: mockSwitchSession,
            deleteSession: mockDeleteSession,
            createNewChat: mockCreateNewChat,
            isTyping: false,
        });
        globalThis.confirm = vi.fn(() => true);
    });

    it("should categorize sessions into time groups", () => {
        render(<Sidebar isOpen={true} />);

        expect(screen.getByText("Today")).toBeInTheDocument();
        expect(screen.getByText("Today Chat")).toBeInTheDocument();

        expect(screen.getByText("Yesterday")).toBeInTheDocument();
        expect(screen.getByText("Yesterday Chat")).toBeInTheDocument();
    });

    it("should allow creating a new chat", () => {
        render(<Sidebar isOpen={true} />);

        const newChatBtn = screen.getByText("New Chat");
        fireEvent.click(newChatBtn);

        expect(mockCreateNewChat).toHaveBeenCalled();
    });

    it("should switch session on click", () => {
        render(<Sidebar isOpen={true} />);

        fireEvent.click(screen.getByText("Yesterday Chat"));
        expect(mockSwitchSession).toHaveBeenCalledWith("2");
    });

    it("should delete session after confirmation", () => {
        render(<Sidebar isOpen={true} />);

        const deleteBtns = screen.getAllByTitle("Delete Chat");
        fireEvent.click(deleteBtns[0]);

        expect(globalThis.confirm).toHaveBeenCalled();
        expect(mockDeleteSession).toHaveBeenCalledWith("1");
    });
});