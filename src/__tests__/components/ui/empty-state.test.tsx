import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "@/components/ui/empty-state";

describe("EmptyState", () => {
  it("renders the title text", () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="T" description="No items found" />);
    expect(screen.getByText("No items found")).toBeInTheDocument();
  });

  it("renders no description element when description is omitted", () => {
    render(<EmptyState title="T" />);
    expect(screen.queryByText(/found/i)).toBeNull();
  });

  it("renders an anchor (link) when action.href is provided", () => {
    render(
      <EmptyState
        title="T"
        action={{ label: "Browse", href: "/products" }}
      />
    );
    const link = screen.getByRole("link", { name: "Browse" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/products");
  });

  it("renders a button when action.onClick is provided (no href)", () => {
    const onClick = jest.fn();
    render(
      <EmptyState
        title="T"
        action={{ label: "Retry", onClick }}
      />
    );
    const btn = screen.getByRole("button", { name: "Retry" });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders no action element when action prop is absent", () => {
    render(<EmptyState title="T" />);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders the icon when provided", () => {
    render(
      <EmptyState
        title="T"
        icon={<span data-testid="custom-icon" />}
      />
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
