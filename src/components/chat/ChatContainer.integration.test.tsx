import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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
    },
}));

vi.mock("../../assistants/groqAi", () => ({
    GroqAiAssistant: vi.fn(function () { return mockAssistants.groq; }),
}));
vi.mock("../../assistants/openAi", () => ({
    OpenAiAssistant: vi.fn(function () { return mockAssistants.openai; }),
}));
vi.mock("../../assistants/googleAi", () => ({
    GoogleAiAssistant: vi.fn(function () { return mockAssistants.google; }),
}));
vi.mock("../../assistants/anthropicAi", () => ({
    AnthropicAiAssistant: vi.fn(function () { return mockAssistants.anthropic; }),
}));
vi.mock("../../assistants/xAi", () => ({
    XAiAssistant: vi.fn(function () { return mockAssistants.xai; }),
}));

vi.mock("framer-motion", () => ({
    motion: {
        div: ({ children, ...props }: React.PropsWithChildren<object>) => (
            <div {...props}>{children}</div>
        ),
    },
    AnimatePresence: ({ children }: React.PropsWithChildren<object>) => <>{children}</>,
}));

globalThis.HTMLElement.prototype.scrollIntoView = vi.fn();

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("ChatContainer Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <ThemeProvider>
                <ChatProvider>
                    {ui}
                </ChatProvider>
            </ThemeProvider>
        );
    };

    describe("Initial State", () => {
        it("should display hero section when no messages", async () => {
            await act(async () => {
                renderWithProviders(<ChatContainer />);
            });

            expect(screen.getByTestId("hero-section")).toBeInTheDocument();
            expect(screen.getByText("Chatbot")).toBeInTheDocument();
            expect(screen.getByText("Ask something challenging.")).toBeInTheDocument();
        });
    });

    describe("Chat Flow Integration", () => {
        it("should display user message and stream AI response", async () => {
            mockAssistants.groq.chatStream.mockImplementation(async (_content, onChunk) => {
                await delay(50);
                onChunk("Hello ");
                await delay(50);
                onChunk("from AI!");
            });

            await act(async () => {
                renderWithProviders(
                    <>
                        <ChatContainer />
                        <Controls />
                    </>
                );
            });

            const input = screen.getByTestId("chat-input");
            const submitBtn = screen.getByTestId("send-btn");

            await act(async () => {
                fireEvent.change(input, { target: { value: "Hi there" } });
                fireEvent.click(submitBtn);
            });

            await waitFor(() => {
                const bubbles = screen.getAllByTestId("chat-bubble");
                expect(bubbles[0]).toHaveTextContent("Hi there");
            });

            await waitFor(() => {
                const bubbles = screen.getAllByTestId("chat-bubble");
                expect(bubbles.length).toBe(2);
                expect(bubbles[1]).toHaveTextContent("Hello from AI!");
            }, { timeout: 5000 });
        });

        it("should show typing indicator during AI response", async () => {
            mockAssistants.groq.chatStream.mockImplementation(async (_content, onChunk) => {
                await delay(200);
                onChunk("Response");
            });

            await act(async () => {
                renderWithProviders(
                    <>
                        <ChatContainer />
                        <Controls />
                    </>
                );
            });

            const input = screen.getByTestId("chat-input");
            const submitBtn = screen.getByTestId("send-btn");

            await act(async () => {
                fireEvent.change(input, { target: { value: "Test" } });
            });

            fireEvent.click(submitBtn);

            await waitFor(() => {
                expect(screen.getByTestId("typing-indicator")).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.queryByTestId("typing-indicator")).not.toBeInTheDocument();
            }, { timeout: 5000 });
        });
    });

    describe("Message List Transition", () => {
        it("should transition from hero to message list after sending message", async () => {
            mockAssistants.groq.chatStream.mockResolvedValue(undefined);

            await act(async () => {
                renderWithProviders(
                    <>
                        <ChatContainer />
                        <Controls />
                    </>
                );
            });

            expect(screen.getByTestId("hero-section")).toBeInTheDocument();

            const input = screen.getByTestId("chat-input");
            const submitBtn = screen.getByTestId("send-btn");

            await act(async () => {
                fireEvent.change(input, { target: { value: "First message" } });
                fireEvent.click(submitBtn);
            });

            await waitFor(() => {
                expect(screen.queryByTestId("hero-section")).not.toBeInTheDocument();
                expect(screen.getByTestId("message-list")).toBeInTheDocument();
            });
        });
    });

    describe("Auto-scroll Behavior", () => {
        it("should scroll to bottom when new messages arrive", async () => {
            mockAssistants.groq.chatStream.mockResolvedValue(undefined);

            await act(async () => {
                renderWithProviders(
                    <>
                        <ChatContainer />
                        <Controls />
                    </>
                );
            });

            const input = screen.getByTestId("chat-input");
            const submitBtn = screen.getByTestId("send-btn");

            await act(async () => {
                fireEvent.change(input, { target: { value: "Test scroll" } });
                fireEvent.click(submitBtn);
            });

            await waitFor(() => {
                expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
            });
        });
    });

    describe("Multiple Messages", () => {
        it("should handle multiple messages in conversation", async () => {
            mockAssistants.groq.chatStream.mockImplementation(async (_content, onChunk) => {
                onChunk("AI Response");
            });

            await act(async () => {
                renderWithProviders(
                    <>
                        <ChatContainer />
                        <Controls />
                    </>
                );
            });

            const input = screen.getByTestId("chat-input");
            const submitBtn = screen.getByTestId("send-btn");

            await act(async () => {
                fireEvent.change(input, { target: { value: "First" } });
                fireEvent.click(submitBtn);
            });

            await waitFor(() => {
                expect(screen.getAllByTestId("chat-bubble").length).toBe(2);
            });

            await act(async () => {
                fireEvent.change(input, { target: { value: "Second" } });
                fireEvent.click(submitBtn);
            });

            await waitFor(() => {
                expect(screen.getAllByTestId("chat-bubble").length).toBe(4);
            }, { timeout: 5000 });
        });
    });

    describe("Error Handling", () => {
        it("should display error message when AI call fails", async () => {
            mockAssistants.groq.chatStream.mockRejectedValue(new Error("API Error"));

            await act(async () => {
                renderWithProviders(
                    <>
                        <ChatContainer />
                        <Controls />
                    </>
                );
            });

            const input = screen.getByTestId("chat-input");
            const submitBtn = screen.getByTestId("send-btn");

            await act(async () => {
                fireEvent.change(input, { target: { value: "Test error" } });
                fireEvent.click(submitBtn);
            });

            await waitFor(() => {
                const bubbles = screen.getAllByTestId("chat-bubble");
                expect(bubbles[1]).toHaveTextContent("Error");
            }, { timeout: 5000 });
        });
    });
});