import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "./Home";

vi.mock("../Sidebar", () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }));
vi.mock("../Header", () => ({ default: () => <div data-testid="header">Header</div> }));
vi.mock("../chat/ChatContainer", () => ({ default: () => <div data-testid="chat-container">Chat</div> }));
vi.mock("../controls/Controls", () => ({ default: () => <div data-testid="controls">Controls</div> }));

vi.mock("../../context/ChatContext", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ChatProvider: ({ children }: any) => <div>{children}</div>,
}));

describe("Home Page", () => {
    it("should render the main layout components", () => {
        render(<Home />);

        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("chat-container")).toBeInTheDocument();
        expect(screen.getByTestId("controls")).toBeInTheDocument();
    });
});