import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Controls from "./Controls";
import * as ChatContext from "../../context/ChatContext";

vi.mock("../../context/ChatContext", () => ({
    useChat: vi.fn(),
}));

vi.mock("../../context/ThemeContext", () => ({
    useTheme: () => ({ theme: "light" }),
}));

describe("Controls Component", () => {
    const mockAddMessage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ChatContext.useChat as any).mockReturnValue({
            addMessage: mockAddMessage,
            isTyping: false,
        });
    });

    it("should update input value when typing", () => {
        render(<Controls />);
        const textarea = screen.getByPlaceholderText("Ask anything...");

        fireEvent.change(textarea, { target: { value: "Hello" } });
        expect(textarea).toHaveValue("Hello");
    });

    it("should call addMessage on Enter key", () => {
        render(<Controls />);
        const textarea = screen.getByPlaceholderText("Ask anything...");

        fireEvent.change(textarea, { target: { value: "Test Message" } });
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

        expect(mockAddMessage).toHaveBeenCalledWith("Test Message");
        expect(textarea).toHaveValue("");
    });

    it("should NOT submit on Shift+Enter", () => {
        render(<Controls />);
        const textarea = screen.getByPlaceholderText("Ask anything...");

        fireEvent.change(textarea, { target: { value: "Line 1" } });
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

        expect(mockAddMessage).not.toHaveBeenCalled();
        expect(textarea).toHaveValue("Line 1");
    });

    it("should be disabled when AI is typing", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (ChatContext.useChat as any).mockReturnValue({
            addMessage: mockAddMessage,
            isTyping: true,
        });

        render(<Controls />);
        const textarea = screen.getByPlaceholderText("Ask anything...");
        const button = screen.getByRole("button");

        expect(textarea).toBeDisabled();
        expect(button).toBeDisabled();
    });
});