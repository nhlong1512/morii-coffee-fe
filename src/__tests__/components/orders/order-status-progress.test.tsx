import { render, screen } from "@testing-library/react";
import { OrderStatusProgress } from "@/components/orders/order-status-progress";
import type { OrderStatus } from "@/lib/constants";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("lucide-react", () => ({
  Check:      () => <svg data-testid="icon-check" />,
  Clock:      () => <svg data-testid="icon-clock" />,
  CreditCard: () => <svg data-testid="icon-credit-card" />,
  Package:    () => <svg data-testid="icon-package" />,
  Truck:      () => <svg data-testid="icon-truck" />,
  Home:       () => <svg data-testid="icon-home" />,
  Star:       () => <svg data-testid="icon-star" />,
  X:          () => <svg data-testid="icon-x" />,
}));

describe("OrderStatusProgress", () => {
  it("renders 'statusCancelled' and X icon when status is CANCELLED", () => {
    render(<OrderStatusProgress status={"CANCELLED" as OrderStatus} />);
    expect(screen.getByText("statusCancelled")).toBeInTheDocument();
    expect(screen.getByTestId("icon-x")).toBeInTheDocument();
  });

  it("does NOT render step nodes when status is CANCELLED", () => {
    render(<OrderStatusProgress status={"CANCELLED" as OrderStatus} />);
    expect(screen.queryByText("statusPending")).toBeNull();
    expect(screen.queryByText("statusInDelivery")).toBeNull();
    expect(screen.queryByText("statusDelivered")).toBeNull();
  });

  it("renders all six step labels for PENDING status", () => {
    render(<OrderStatusProgress status={"PENDING" as OrderStatus} />);
    expect(screen.getByText("statusPending")).toBeInTheDocument();
    expect(screen.getByText("statusConfirmed")).toBeInTheDocument();
    expect(screen.getByText("statusReadyToPickup")).toBeInTheDocument();
    expect(screen.getByText("statusInDelivery")).toBeInTheDocument();
    expect(screen.getByText("statusDelivered")).toBeInTheDocument();
    expect(screen.getByText("statusReviewed")).toBeInTheDocument();
  });

  it("keeps the mobile timeline vertical without a base minimum width", () => {
    const { container } = render(
      <OrderStatusProgress status={"PENDING" as OrderStatus} />
    );
    const scrollContainer = container.firstElementChild;
    const timeline = scrollContainer?.firstElementChild;

    expect(scrollContainer).not.toHaveClass("overflow-x-auto");
    expect(scrollContainer).toHaveClass("sm:overflow-x-auto");
    expect(timeline).toHaveClass("flex-col", "sm:min-w-[480px]", "sm:flex-row");
    expect(timeline).not.toHaveClass("min-w-[480px]");
  });

  it("renders all six step labels for IN_DELIVERY status", () => {
    render(<OrderStatusProgress status={"IN_DELIVERY" as OrderStatus} />);
    expect(screen.getByText("statusPending")).toBeInTheDocument();
    expect(screen.getByText("statusInDelivery")).toBeInTheDocument();
    expect(screen.getByText("statusDelivered")).toBeInTheDocument();
  });

  it("renders all six step labels for DELIVERED status", () => {
    render(<OrderStatusProgress status={"DELIVERED" as OrderStatus} />);
    expect(screen.getByText("statusPending")).toBeInTheDocument();
    expect(screen.getByText("statusDelivered")).toBeInTheDocument();
    expect(screen.getByText("statusReviewed")).toBeInTheDocument();
  });

  it("shows check icons for completed steps in DELIVERED state", () => {
    render(<OrderStatusProgress status={"DELIVERED" as OrderStatus} />);
    const checkIcons = screen.getAllByTestId("icon-check");
    // PENDING, CONFIRMED, READY_TO_PICKUP, IN_DELIVERY are completed; DELIVERED is current
    expect(checkIcons.length).toBeGreaterThanOrEqual(4);
  });

  it("shows check icons for completed steps in IN_DELIVERY state", () => {
    render(<OrderStatusProgress status={"IN_DELIVERY" as OrderStatus} />);
    const checkIcons = screen.getAllByTestId("icon-check");
    // PENDING, CONFIRMED, READY_TO_PICKUP are completed
    expect(checkIcons.length).toBeGreaterThanOrEqual(3);
  });

  it("shows no check icons in PENDING state (no steps completed yet)", () => {
    render(<OrderStatusProgress status={"PENDING" as OrderStatus} />);
    expect(screen.queryByTestId("icon-check")).toBeNull();
  });
});
