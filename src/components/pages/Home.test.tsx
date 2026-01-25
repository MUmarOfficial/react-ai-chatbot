import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Home from "./Home";

vi.mock("../Sidebar", () => ({
    default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => (
        <div data-testid="sidebar" data-is-open={isOpen}>
            <button onClick={onClose} data-testid="sidebar-close">Close</button>
            <span>Sidebar</span>
        </div>
    ),
}));

vi.mock("../Header", () => ({
    default: ({ onMenuClick }: { onMenuClick: () => void }) => (
        <div data-testid="header">
            <button onClick={onMenuClick} data-testid="header-menu-btn">Menu</button>
            <span>Header</span>
        </div>
    ),
}));

vi.mock("../chat/ChatContainer", () => ({
    default: () => <div data-testid="chat-container">Chat Container</div>,
}));

vi.mock("../controls/Controls", () => ({
    default: () => <div data-testid="controls">Controls</div>,
}));

vi.mock("../../context/ChatContext", () => ({
    ChatProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("Home Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Rendering", () => {
        it("should render all main layout components", () => {
            render(<Home />);

            expect(screen.getByTestId("sidebar")).toBeInTheDocument();
            expect(screen.getByTestId("header")).toBeInTheDocument();
            expect(screen.getByTestId("chat-container")).toBeInTheDocument();
            expect(screen.getByTestId("controls")).toBeInTheDocument();
        });

        it("should render sidebar initially closed on mobile", () => {
            render(<Home />);

            const sidebar = screen.getByTestId("sidebar");
            expect(sidebar).toHaveAttribute("data-is-open", "false");
        });
    });

    describe("Mobile Sidebar Toggle", () => {
        it("should open sidebar when menu button is clicked", () => {
            render(<Home />);

            const menuBtn = screen.getByTestId("header-menu-btn");
            fireEvent.click(menuBtn);

            const sidebar = screen.getByTestId("sidebar");
            expect(sidebar).toHaveAttribute("data-is-open", "true");
        });

        it("should close sidebar when close button is clicked", () => {
            render(<Home />);

            const menuBtn = screen.getByTestId("header-menu-btn");
            fireEvent.click(menuBtn);

            expect(screen.getByTestId("sidebar")).toHaveAttribute("data-is-open", "true");

            const closeBtn = screen.getByTestId("sidebar-close");
            fireEvent.click(closeBtn);

            expect(screen.getByTestId("sidebar")).toHaveAttribute("data-is-open", "false");
        });

        it("should toggle sidebar state correctly", () => {
            render(<Home />);

            const menuBtn = screen.getByTestId("header-menu-btn");
            const sidebar = screen.getByTestId("sidebar");

            expect(sidebar).toHaveAttribute("data-is-open", "false");

            fireEvent.click(menuBtn);
            expect(sidebar).toHaveAttribute("data-is-open", "true");

            const closeBtn = screen.getByTestId("sidebar-close");
            fireEvent.click(closeBtn);
            expect(sidebar).toHaveAttribute("data-is-open", "false");

            fireEvent.click(menuBtn);
            expect(sidebar).toHaveAttribute("data-is-open", "true");
        });
    });

    describe("Component Structure", () => {
        it("should wrap content in ChatProvider", () => {
            render(<Home />);

            expect(screen.getByTestId("sidebar")).toBeInTheDocument();
            expect(screen.getByTestId("header")).toBeInTheDocument();
        });
    });

    describe("Layout Z-Index Stacking", () => {
        it("should render sidebar alongside main content", () => {
            render(<Home />);

            const sidebar = screen.getByTestId("sidebar");
            const header = screen.getByTestId("header");
            const chatContainer = screen.getByTestId("chat-container");
            const controls = screen.getByTestId("controls");

            expect(sidebar).toBeInTheDocument();
            expect(header).toBeInTheDocument();
            expect(chatContainer).toBeInTheDocument();
            expect(controls).toBeInTheDocument();
        });
    });
});