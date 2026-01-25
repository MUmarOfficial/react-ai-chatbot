import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DataConsentModal } from "./DataConsentModal";

vi.mock("./DataConsentModal.module.css", () => ({
    default: {
        overlay: "overlay",
        modal: "modal",
        title: "title",
        description: "description",
        buttonGroup: "buttonGroup",
        btnDecline: "btnDecline",
        btnAccept: "btnAccept",
    },
}));

describe("DataConsentModal Component", () => {
    const mockOnConsent = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("Rendering", () => {
        it("should not render immediately (delayed visibility)", () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            expect(screen.queryByText("Data Storage Preference")).not.toBeInTheDocument();
        });

        it("should render after delay", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByText("Data Storage Preference")).toBeInTheDocument();
            }, { timeout: 500 });
        });

        it("should render modal content correctly", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByText("Data Storage Preference")).toBeInTheDocument();
            }, { timeout: 500 });

            expect(screen.getByText(/Would you like to save your chat history/)).toBeInTheDocument();
            expect(screen.getByText("No, don't save")).toBeInTheDocument();
            expect(screen.getByText("Yes, save chats")).toBeInTheDocument();
        });
    });

    describe("Popup Behavior", () => {
        it("should render as dialog element with overlay", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByText("Data Storage Preference")).toBeInTheDocument();
            }, { timeout: 500 });

            const dialog = document.querySelector("dialog[aria-labelledby='modal-title']");
            expect(dialog).toBeInTheDocument();
        });

        it("should have proper aria-labelledby for accessibility", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByText("Data Storage Preference")).toBeInTheDocument();
            }, { timeout: 500 });

            const dialog = document.querySelector("dialog");
            expect(dialog).toHaveAttribute("aria-labelledby", "modal-title");
        });
    });

    describe("User Actions", () => {
        it("should call onConsent with true when accepting", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByText("Yes, save chats")).toBeInTheDocument();
            }, { timeout: 500 });

            const acceptBtn = screen.getByText("Yes, save chats");
            fireEvent.click(acceptBtn);

            expect(mockOnConsent).toHaveBeenCalledWith(true);
            expect(mockOnConsent).toHaveBeenCalledTimes(1);
        });

        it("should call onConsent with false when declining", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByText("No, don't save")).toBeInTheDocument();
            }, { timeout: 500 });

            const declineBtn = screen.getByText("No, don't save");
            fireEvent.click(declineBtn);

            expect(mockOnConsent).toHaveBeenCalledWith(false);
            expect(mockOnConsent).toHaveBeenCalledTimes(1);
        });
    });

    describe("Accessibility", () => {
        it("should have accessible button labels", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByLabelText(/decline local storage/i)).toBeInTheDocument();
            }, { timeout: 500 });

            expect(screen.getByLabelText(/accept local storage/i)).toBeInTheDocument();
        });

        it("should have a title heading", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByText("Data Storage Preference")).toBeInTheDocument();
            }, { timeout: 500 });

            const title = screen.getByText("Data Storage Preference");
            expect(title.tagName.toLowerCase()).toBe("h2");
        });
    });

    describe("Z-Index / Depth Testing", () => {
        it("should render as dialog element", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByText("Data Storage Preference")).toBeInTheDocument();
            }, { timeout: 500 });

            const dialog = document.querySelector("dialog");
            expect(dialog).toBeInTheDocument();
            expect(dialog?.tagName.toLowerCase()).toBe("dialog");
        });

        it("should have overlay class for proper stacking", async () => {
            render(<DataConsentModal onConsent={mockOnConsent} />);

            await waitFor(() => {
                expect(screen.getByText("Data Storage Preference")).toBeInTheDocument();
            }, { timeout: 500 });

            const dialog = document.querySelector("dialog");
            expect(dialog).toHaveClass("overlay");
        });
    });
});
