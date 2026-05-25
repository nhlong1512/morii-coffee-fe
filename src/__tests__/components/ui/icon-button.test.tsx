import { render, screen } from "@testing-library/react";
import { IconButton } from "@/components/ui/icon-button";
import { Heart } from "lucide-react";

describe("IconButton", () => {
  it("renders as a button by default", () => {
    render(
      <IconButton aria-label="test">
        <Heart className="h-4 w-4" />
      </IconButton>
    );
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders as child component when asChild is true", () => {
    render(
      <IconButton asChild aria-label="test">
        <a href="/wishlist">
          <Heart className="h-4 w-4" />
        </a>
      </IconButton>
    );
    expect(screen.getByRole("link")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/wishlist");
  });

  it("shows no badge when badge is 0 or undefined", () => {
    const { rerender } = render(
      <IconButton aria-label="test">
        <Heart className="h-4 w-4" />
      </IconButton>
    );
    expect(screen.queryByText(/\d+/)).toBeNull();

    rerender(
      <IconButton badge={0} aria-label="test">
        <Heart className="h-4 w-4" />
      </IconButton>
    );
    expect(screen.queryByText(/\d+/)).toBeNull();
  });

  it("shows badge with correct count", () => {
    render(
      <IconButton badge={5} aria-label="test">
        <Heart className="h-4 w-4" />
      </IconButton>
    );
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows '99+' when badge exceeds 99", () => {
    render(
      <IconButton badge={100} aria-label="test">
        <Heart className="h-4 w-4" />
      </IconButton>
    );
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("applies primary badge variant by default", () => {
    render(
      <IconButton badge={3} aria-label="test">
        <Heart className="h-4 w-4" />
      </IconButton>
    );
    const badge = screen.getByText("3");
    expect(badge).toHaveClass("bg-primary", "text-primary-foreground");
  });

  it("applies destructive badge variant when specified", () => {
    render(
      <IconButton badge={3} badgeVariant="destructive" aria-label="test">
        <Heart className="h-4 w-4" />
      </IconButton>
    );
    const badge = screen.getByText("3");
    expect(badge).toHaveClass("bg-destructive", "text-destructive-foreground");
  });

  it("has correct styling classes", () => {
    const { container } = render(
      <IconButton aria-label="test">
        <Heart className="h-4 w-4" />
      </IconButton>
    );
    const button = container.querySelector("button");
    expect(button).toHaveClass(
      "relative",
      "flex",
      "h-9",
      "w-9",
      "items-center",
      "justify-center",
      "rounded-lg",
      "border",
      "border-input",
      "bg-background",
      "transition-colors",
      "hover:bg-accent"
    );
  });
});
