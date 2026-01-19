import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Sidebar from "./Sidebar";
import { ChatProvider } from "../context/ChatContext";

vi.mock("../assistants/groqAi", () => ({
    GroqAiAssistant: vi.fn(function () {
        return { chatStream: vi.fn() };
    }),
}));
vi.mock("../assistants/openAi", () => ({
    OpenAiAssistant: vi.fn(function () {
        return { chatStream: vi.fn() };
    }),
}));
vi.mock("../assistants/googleAi", () => ({
    GoogleAiAssistant: vi.fn(function () {
        return { chatStream: vi.fn() };
    }),
}));
vi.mock("../assistants/anthropicAi", () => ({
    AnthropicAiAssistant: vi.fn(function () {
        return { chatStream: vi.fn() };
    }),
}));
vi.mock("../assistants/xAi", () => ({
    XAiAssistant: vi.fn(function () {
        return { chatStream: vi.fn() };
    }),
}));

describe("Sidebar Integration", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        globalThis.confirm = vi.fn(() => true);
        localStorage.clear();
    });

    it("should manage chat sessions correctly", async () => {
        await act(async () => {
            render(
                <ChatProvider>
                    <Sidebar isOpen={true} />
                </ChatProvider>
            );
        });

        const initialNewChats = screen.getAllByText("New Chat");
        const initialCount = initialNewChats.length;

        const allButtons = screen.getAllByRole("button", { name: /new chat/i });
        const newChatHeaderButton = allButtons[0];

        await act(async () => {
            fireEvent.click(newChatHeaderButton);
        });

        const updatedNewChats = screen.getAllByText("New Chat");
        expect(updatedNewChats.length).toBe(initialCount + 1);
    });

    it("should delete a session", async () => {
        await act(async () => {
            render(
                <ChatProvider>
                    <Sidebar isOpen={true} />
                </ChatProvider>
            );
        });

        const deleteBtn = screen.getByTitle("Delete Chat");

        await act(async () => {
            fireEvent.click(deleteBtn);
        });

        expect(globalThis.confirm).toHaveBeenCalled();

        expect(screen.getAllByText("New Chat").length).toBeGreaterThan(0);
    });
});