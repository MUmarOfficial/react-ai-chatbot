import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "./App";

vi.mock("./components/pages/Home", () => ({
    default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock("./context/ThemeContext", () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="theme-provider">{children}</div>
    ),
}));

describe("App Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Rendering", () => {
        it("should render the application entry point", () => {
            render(<App />);

            expect(screen.getByTestId("home-page")).toBeInTheDocument();
        });

        it("should wrap content with ThemeProvider", () => {
            render(<App />);

            expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
            expect(screen.getByTestId("theme-provider")).toContainElement(
                screen.getByTestId("home-page")
            );
        });
    });

    describe("Provider Hierarchy", () => {
        it("should render Home within ThemeProvider", () => {
            render(<App />);

            const themeProvider = screen.getByTestId("theme-provider");
            const homePage = screen.getByTestId("home-page");

            expect(themeProvider).toContainElement(homePage);
        });
    });

    describe("Structure", () => {
        it("should render without errors", () => {
            expect(() => render(<App />)).not.toThrow();
        });

        it("should display Home page content", () => {
            render(<App />);

            expect(screen.getByText("Home Page")).toBeInTheDocument();
        });
    });
});