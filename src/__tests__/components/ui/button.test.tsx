import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders without throwing", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it.each([
    ["default"],
    ["destructive"],
    ["outline"],
    ["secondary"],
    ["ghost"],
    ["link"],
  ] as const)("variant=%s renders an accessible button element", (variant) => {
    render(<Button variant={variant}>Label</Button>);
    expect(screen.getByRole("button", { name: "Label" })).toBeInTheDocument();
  });

  it("disabled button does not call onClick", () => {
    const onClick = jest.fn();
    render(
      <Button disabled onClick={onClick}>
        Disabled
      </Button>
    );
    fireEvent.click(screen.getByRole("button", { name: "Disabled" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when not disabled", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Active</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Active" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("asChild renders the child element instead of a button", () => {
    render(
      <Button asChild>
        <a href="/home">Home</a>
      </Button>
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
  });

  it("size=icon renders without throwing", () => {
    render(<Button size="icon" aria-label="icon-btn">X</Button>);
    expect(screen.getByRole("button", { name: "icon-btn" })).toBeInTheDocument();
  });
});
