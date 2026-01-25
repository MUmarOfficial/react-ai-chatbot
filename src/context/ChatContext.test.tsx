import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChatProvider, useChat } from "./ChatContext";
import type { ReactNode } from "react";

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

// Helper functions extracted to reduce nesting depth
const createStreamingMock = () => async (_msg: unknown, onChunk: (chunk: string) => void) => {
    await new Promise((r) => setTimeout(r, 10));
    onChunk("Hello");
    await new Promise((r) => setTimeout(r, 10));
    onChunk(" World");
};

const isMatchingSession = (targetId: string) => (session: { id: string }) => session.id === targetId;

describe("ChatContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
        <ChatProvider>{children}</ChatProvider>
    );

    describe("Initial State", () => {
        it("should initialize with empty messages", () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            expect(result.current.messages).toEqual([]);
        });

        it("should initialize with default model", () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            expect(result.current.currentModel).toBe("Llama 3.3 (Groq)");
        });

        it("should provide available models", () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            expect(result.current.availableModels).toContain("Llama 3.3 (Groq)");
            expect(result.current.availableModels).toContain("GPT 5");
            expect(result.current.availableModels).toContain("Gemini 2.5");
        });

        it("should not be typing initially", () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            expect(result.current.isTyping).toBe(false);
        });

        it("should create initial session", async () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            await waitFor(() => {
                expect(result.current.sessions.length).toBeGreaterThan(0);
            });
        });
    });

    describe("Model Selection", () => {
        it("should change current model", () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            act(() => {
                result.current.setModel("GPT 5");
            });

            expect(result.current.currentModel).toBe("GPT 5");
        });

        it("should allow switching between all available models", () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            for (const model of result.current.availableModels) {
                act(() => {
                    result.current.setModel(model);
                });
                expect(result.current.currentModel).toBe(model);
            }
        });
    });

    describe("Message Handling", () => {
        it("should add user message and get AI response", async () => {
            mockAssistants.groq.chatStream.mockImplementation(createStreamingMock());

            const { result } = renderHook(() => useChat(), { wrapper });

            await act(async () => {
                await result.current.addMessage("Test message");
            });

            await waitFor(() => {
                expect(result.current.messages.length).toBe(2);
                expect(result.current.messages[0].role).toBe("user");
                expect(result.current.messages[0].content).toBe("Test message");
                expect(result.current.messages[1].role).toBe("assistant");
                expect(result.current.messages[1].content).toBe("Hello World");
            }, { timeout: 3000 });
        });

        it("should not add empty messages", async () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            await act(async () => {
                await result.current.addMessage("");
            });

            expect(result.current.messages.length).toBe(0);
        });

        it("should not add whitespace-only messages", async () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            await act(async () => {
                await result.current.addMessage("   ");
            });

            expect(result.current.messages.length).toBe(0);
        });
    });

    describe("Session Management", () => {
        it("should create new chat session", async () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            await waitFor(() => {
                expect(result.current.sessions.length).toBe(1);
            });

            act(() => {
                result.current.createNewChat();
            });

            expect(result.current.sessions.length).toBe(2);
            expect(result.current.messages).toEqual([]);
        });

        it("should switch between sessions", async () => {
            mockAssistants.groq.chatStream.mockResolvedValue(undefined);

            const { result } = renderHook(() => useChat(), { wrapper });

            await waitFor(() => {
                expect(result.current.sessions.length).toBe(1);
            });

            act(() => {
                result.current.createNewChat();
            });

            const firstSessionId = result.current.sessions[1].id;
            const secondSessionId = result.current.sessions[0].id;

            act(() => {
                result.current.switchSession(firstSessionId);
            });

            expect(result.current.currentSessionId).toBe(firstSessionId);

            act(() => {
                result.current.switchSession(secondSessionId);
            });

            expect(result.current.currentSessionId).toBe(secondSessionId);
        });

        it("should delete session and keep at least one", async () => {
            const { result } = renderHook(() => useChat(), { wrapper });

            await waitFor(() => {
                expect(result.current.sessions.length).toBe(1);
            });

            act(() => {
                result.current.createNewChat();
            });

            expect(result.current.sessions.length).toBe(2);

            const sessionIdToDelete = result.current.sessions[1].id;

            act(() => {
                result.current.deleteSession(sessionIdToDelete);
            });

            expect(result.current.sessions.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe("Error Handling", () => {
        it("should handle AI error gracefully", async () => {
            mockAssistants.groq.chatStream.mockRejectedValue(new Error("API Error"));

            const { result } = renderHook(() => useChat(), { wrapper });

            await waitFor(() => {
                expect(result.current.sessions.length).toBe(1);
            });

            await act(async () => {
                await result.current.addMessage("Test error");
            });

            await waitFor(() => {
                expect(result.current.messages.length).toBe(2);
                expect(result.current.messages[1].content).toContain("Error");
            });
        });

        it("should reset isTyping after error", async () => {
            mockAssistants.groq.chatStream.mockRejectedValue(new Error("API Error"));

            const { result } = renderHook(() => useChat(), { wrapper });

            await waitFor(() => {
                expect(result.current.sessions.length).toBe(1);
            });

            await act(async () => {
                await result.current.addMessage("Test");
            });

            await waitFor(() => {
                expect(result.current.isTyping).toBe(false);
            });
        });
    });

    describe("Session Title Generation", () => {
        it("should update session title from first user message", async () => {
            mockAssistants.groq.chatStream.mockResolvedValue(undefined);

            const { result } = renderHook(() => useChat(), { wrapper });

            await waitFor(() => {
                expect(result.current.sessions.length).toBe(1);
            });

            await act(async () => {
                await result.current.addMessage("This is my first message about testing");
            });

            await waitFor(() => {
                const currentSession = result.current.sessions.find(
                    isMatchingSession(result.current.currentSessionId ?? "")
                );
                expect(currentSession?.title).toContain("This is my first message");
            });
        });
    });
});