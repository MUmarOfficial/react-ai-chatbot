import { describe, it, expect, vi, beforeEach } from "vitest";
import { OpenAiAssistant } from "./openAi";
import { GoogleAiAssistant } from "./googleAi";
import { GoogleGenAI } from "@google/genai";

vi.mock("@google/genai", () => {
    return {
        GoogleGenAI: vi.fn(function () {
            return {
                models: {
                    generateContentStream: vi.fn(),
                },
            };
        }),
    };
});

describe("AI Assistants", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("OpenAiAssistant", () => {
        it("should stream content correctly", async () => {
            const mockStream = {
                [Symbol.asyncIterator]: async function* () {
                    yield { choices: [{ delta: { content: "Hello" } }] };
                    yield { choices: [{ delta: { content: " from GPT" } }] };
                },
            };

            const mockCreate = vi.fn().mockResolvedValue(mockStream);

            const mockClient = {
                chat: { completions: { create: mockCreate } },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any;

            const assistant = new OpenAiAssistant("gpt-4o", mockClient);

            const onChunk = vi.fn();

            await assistant.chatStream("Hi", onChunk);

            expect(mockCreate).toHaveBeenCalled();
            expect(onChunk).toHaveBeenCalledWith("Hello");
            expect(onChunk).toHaveBeenCalledWith(" from GPT");
        });
    });

    describe("GoogleAiAssistant", () => {
        it("should stream content correctly", async () => {
            const mockStream = {
                [Symbol.asyncIterator]: async function* () {
                    yield { text: "Hello" };
                    yield { text: " Gemini" };
                },
            };

            const mockGenerateContentStream = vi.fn().mockResolvedValue(mockStream);

            (GoogleGenAI as unknown as ReturnType<typeof vi.fn>).mockImplementation(function () {
                return {
                    models: {
                        generateContentStream: mockGenerateContentStream,
                    },
                };
            });

            const assistant = new GoogleAiAssistant();
            const onChunk = vi.fn();

            await assistant.chatStream("Hi", onChunk);

            expect(mockGenerateContentStream).toHaveBeenCalled();
            expect(onChunk).toHaveBeenCalledWith("Hello");
            expect(onChunk).toHaveBeenCalledWith(" Gemini");
        });
    });
});