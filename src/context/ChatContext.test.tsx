import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatProvider, useChat } from "./ChatContext";

const { mockAssistants } = vi.hoisted(() => ({
    mockAssistants: {
        groq: { chatStream: vi.fn() },
        openai: { chatStream: vi.fn() },
        google: { chatStream: vi.fn() },
        anthropic: { chatStream: vi.fn() },
        xai: { chatStream: vi.fn() },
    }
}));

vi.mock("../assistants/groqAi", () => ({ GroqAiAssistant: vi.fn(function () { return mockAssistants.groq; }) }));
vi.mock("../assistants/openAi", () => ({ OpenAiAssistant: vi.fn(function () { return mockAssistants.openai; }) }));
vi.mock("../assistants/googleAi", () => ({ GoogleAiAssistant: vi.fn(function () { return mockAssistants.google; }) }));
vi.mock("../assistants/anthropicAi", () => ({ AnthropicAiAssistant: vi.fn(function () { return mockAssistants.anthropic; }) }));
vi.mock("../assistants/xAi", () => ({ XAiAssistant: vi.fn(function () { return mockAssistants.xai; }) }));

describe("ChatContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it("adds a user message and handles AI response", async () => {
        mockAssistants.groq.chatStream.mockImplementation(async (_msg, onChunk) => {
            await new Promise(r => setTimeout(r, 10));
            onChunk("Hello");
            await new Promise(r => setTimeout(r, 10));
            onChunk(" World");
        });

        const { result } = renderHook(() => useChat(), { wrapper: ChatProvider });

        await act(async () => {
            await result.current.addMessage("Hi AI");
        });

        await waitFor(() => {
            expect(result.current.messages).toHaveLength(2);
            expect(result.current.messages[1].content).toBe("Hello World");
        }, { timeout: 3000 });
    });
});