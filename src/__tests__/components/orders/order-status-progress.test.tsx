import { render, screen } from "@testing-library/react";
import { OrderStatusProgress } from "@/components/orders/order-status-progress";
import type { OrderStatus } from "@/lib/constants";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("lucide-react", () => ({
  Check: () => <svg data-testid="icon-check" />,
  Package: () => <svg data-testid="icon-package" />,
  Truck: () => <svg data-testid="icon-truck" />,
  Home: () => <svg data-testid="icon-home" />,
  X: () => <svg data-testid="icon-x" />,
}));

describe("OrderStatusProgress", () => {
  it("renders 'statusCancelled' and X icon when status is cancelled", () => {
    render(<OrderStatusProgress status={"cancelled" as OrderStatus} />);
    expect(screen.getByText("statusCancelled")).toBeInTheDocument();
    expect(screen.getByTestId("icon-x")).toBeInTheDocument();
  });

  it("does NOT render step nodes when status is cancelled", () => {
    render(<OrderStatusProgress status={"cancelled" as OrderStatus} />);
    expect(screen.queryByText("statusProcessing")).toBeNull();
    expect(screen.queryByText("statusInTransit")).toBeNull();
    expect(screen.queryByText("statusDelivered")).toBeNull();
  });

  it("renders all three step labels for processing status", () => {
    render(<OrderStatusProgress status={"processing" as OrderStatus} />);
    expect(screen.getByText("statusProcessing")).toBeInTheDocument();
    expect(screen.getByText("statusInTransit")).toBeInTheDocument();
    expect(screen.getByText("statusDelivered")).toBeInTheDocument();
  });

  it("renders all three step labels for in-transit status", () => {
    render(<OrderStatusProgress status={"in-transit" as OrderStatus} />);
    expect(screen.getByText("statusProcessing")).toBeInTheDocument();
    expect(screen.getByText("statusInTransit")).toBeInTheDocument();
    expect(screen.getByText("statusDelivered")).toBeInTheDocument();
  });

  it("renders all three step labels for delivered status", () => {
    render(<OrderStatusProgress status={"delivered" as OrderStatus} />);
    expect(screen.getByText("statusProcessing")).toBeInTheDocument();
    expect(screen.getByText("statusInTransit")).toBeInTheDocument();
    expect(screen.getByText("statusDelivered")).toBeInTheDocument();
  });

  it("shows check icons for completed steps in delivered state", () => {
    render(<OrderStatusProgress status={"delivered" as OrderStatus} />);
    const checkIcons = screen.getAllByTestId("icon-check");
    // processing and in-transit are completed (isCompleted), delivered is current (shows Home icon)
    expect(checkIcons.length).toBeGreaterThanOrEqual(2);
  });

  it("shows check icons for completed steps in in-transit state", () => {
    render(<OrderStatusProgress status={"in-transit" as OrderStatus} />);
    const checkIcons = screen.getAllByTestId("icon-check");
    // processing is completed
    expect(checkIcons.length).toBeGreaterThanOrEqual(1);
  });

  it("shows no check icons in processing state (no steps completed yet)", () => {
    render(<OrderStatusProgress status={"processing" as OrderStatus} />);
    expect(screen.queryByTestId("icon-check")).toBeNull();
  });
});
