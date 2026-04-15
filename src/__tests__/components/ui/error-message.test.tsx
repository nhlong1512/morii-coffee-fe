import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorMessage } from "@/components/ui/error-message";

describe("ErrorMessage", () => {
  describe("inline variant (default)", () => {
    it("renders the message text", () => {
      render(<ErrorMessage message="Field is required" />);
      expect(screen.getByText("Field is required")).toBeInTheDocument();
    });

    it("does NOT render with role=alert (inline is compact, not a page alert)", () => {
      render(<ErrorMessage message="Error!" inline />);
      expect(screen.queryByRole("alert")).toBeNull();
    });
  });

  describe("block variant (inline=false)", () => {
    it("renders with role=alert", () => {
      render(<ErrorMessage message="Something went wrong" inline={false} />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("renders the message text inside the alert", () => {
      render(<ErrorMessage message="Server error" inline={false} />);
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });

    it("renders a dismiss button when dismissible=true and onDismiss is provided", () => {
      const onDismiss = jest.fn();
      render(
        <ErrorMessage
          message="Err"
          inline={false}
          dismissible
          onDismiss={onDismiss}
        />
      );
      const dismissBtn = screen.getByRole("button", { name: /dismiss/i });
      expect(dismissBtn).toBeInTheDocument();
      fireEvent.click(dismissBtn);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("does not render dismiss button when dismissible=false", () => {
      render(
        <ErrorMessage
          message="Err"
          inline={false}
          dismissible={false}
          onDismiss={jest.fn()}
        />
      );
      expect(screen.queryByRole("button", { name: /dismiss/i })).toBeNull();
    });

    it("does not render dismiss button when onDismiss is absent even if dismissible=true", () => {
      render(<ErrorMessage message="Err" inline={false} dismissible />);
      expect(screen.queryByRole("button", { name: /dismiss/i })).toBeNull();
    });
  });
});
