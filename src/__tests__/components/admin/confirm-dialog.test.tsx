import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const defaultProps = {
  title: "Delete item?",
  description: "This action cannot be undone.",
  onConfirm: jest.fn(),
  onOpenChange: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ConfirmDialog", () => {
  it("renders title and description when open=true", () => {
    render(<ConfirmDialog {...defaultProps} open />);
    expect(screen.getByText("Delete item?")).toBeInTheDocument();
    expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
  });

  it("does not render dialog content when open=false", () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Delete item?")).toBeNull();
  });

  it("calls onConfirm when Confirm button is clicked", () => {
    const onConfirm = jest.fn();
    render(<ConfirmDialog {...defaultProps} open onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(false) when Confirm button is clicked", () => {
    const onOpenChange = jest.fn();
    render(<ConfirmDialog {...defaultProps} open onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onOpenChange(false) when Cancel button is clicked", () => {
    const onOpenChange = jest.fn();
    render(<ConfirmDialog {...defaultProps} open onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does NOT call onConfirm when Cancel is clicked", () => {
    const onConfirm = jest.fn();
    render(<ConfirmDialog {...defaultProps} open onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("renders without throwing for variant=destructive", () => {
    expect(() =>
      render(<ConfirmDialog {...defaultProps} open variant="destructive" />)
    ).not.toThrow();
    expect(screen.getByRole("button", { name: /confirm/i })).toBeInTheDocument();
  });

  it("renders without throwing for variant=default", () => {
    expect(() =>
      render(<ConfirmDialog {...defaultProps} open variant="default" />)
    ).not.toThrow();
  });
});
