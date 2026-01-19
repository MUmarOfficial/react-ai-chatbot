import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ChatContainer from "./ChatContainer";
import Controls from "../controls/Controls";
import { ChatProvider } from "../../context/ChatContext";
import { ThemeProvider } from "../../context/ThemeContext";

const { mockAssistants } = vi.hoisted(() => ({
    mockAssistants: {
        groq: { chatStream: vi.fn() },
        openai: { chatStream: vi.fn() },
        google: { chatStream: vi.fn() },
        anthropic: { chatStream: vi.fn() },
        xai: { chatStream: vi.fn() },
    }
}));

vi.mock("../../assistants/groqAi", () => ({ GroqAiAssistant: vi.fn(function () { return mockAssistants.groq; }) }));
vi.mock("../../assistants/openAi", () => ({ OpenAiAssistant: vi.fn(function () { return mockAssistants.openai; }) }));
vi.mock("../../assistants/googleAi", () => ({ GoogleAiAssistant: vi.fn(function () { return mockAssistants.google; }) }));
vi.mock("../../assistants/anthropicAi", () => ({ AnthropicAiAssistant: vi.fn(function () { return mockAssistants.anthropic; }) }));
vi.mock("../../assistants/xAi", () => ({ XAiAssistant: vi.fn(function () { return mockAssistants.xai; }) }));

globalThis.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("Chat Integration Flow", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("should display user message and stream AI response", async () => {
        mockAssistants.groq.chatStream.mockImplementation(async (_content, onChunk) => {
            await new Promise(r => setTimeout(r, 50));
            onChunk("Integration ");
            await new Promise(r => setTimeout(r, 50));
            onChunk("Success");
        });

        render(
            <ThemeProvider>
                <ChatProvider>
                    <ChatContainer />
                    <Controls />
                </ChatProvider>
            </ThemeProvider>
        );

        const input = screen.getByTestId("chat-input");
        const submitBtn = screen.getByTestId("send-btn");

        fireEvent.change(input, { target: { value: "Hello Integration" } });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            const bubbles = screen.getAllByTestId("chat-bubble");
            expect(bubbles[0]).toHaveTextContent("Hello Integration");
        });

        await waitFor(() => {
            const bubbles = screen.getAllByTestId("chat-bubble");
            expect(bubbles).toHaveLength(2);
            expect(bubbles[1]).toHaveTextContent("Integration Success");
        }, { timeout: 4000 });
    });
});