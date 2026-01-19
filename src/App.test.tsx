import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

vi.mock("./components/pages/Home", () => ({
    default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock("./context/ThemeContext", () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ThemeProvider: ({ children }: any) => <div>{children}</div>,
}));

describe("App Root", () => {
    it("should render the application entry point", () => {
        render(<App />);
        expect(screen.getByTestId("home-page")).toBeInTheDocument();
    });
});