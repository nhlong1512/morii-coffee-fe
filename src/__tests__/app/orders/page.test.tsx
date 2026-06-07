import { render, screen, waitFor } from "@testing-library/react";
import OrdersPage from "@/app/orders/page";

const getOrderHistoryMock = jest.fn();
const getOrderPaymentSummaryMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

jest.mock("@/hooks/use-protected-route", () => ({
  useProtectedRoute: () => ({ isLoading: false }),
}));

jest.mock("@/services/order-service", () => ({
  getOrderHistory: (...args: unknown[]) => getOrderHistoryMock(...args),
}));

jest.mock("@/services/payment-service", () => ({
  getOrderPaymentSummary: (...args: unknown[]) => getOrderPaymentSummaryMock(...args),
}));

describe("OrdersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getOrderHistoryMock.mockResolvedValue({
      items: [
        {
          id: "order-1",
          orderNumber: "MRC-1",
          createdAt: "2026-05-24T10:00:00Z",
          orderStatus: "IN_DELIVERY",
          total: 209000,
          paymentMethod: "COD",
          itemCount: 2,
          firstProductName: "Latte",
          deliveryMethod: "GHN_DELIVERY",
          shipmentStatus: "DELIVERING",
          shipmentStatusLabel: "delivering",
        },
      ],
      hasNext: false,
      totalCount: 1,
    });
    getOrderPaymentSummaryMock.mockResolvedValue(null);
  });

  it("renders delivery method and shipment status for GHN orders", async () => {
    render(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText("MRC-1")).toBeInTheDocument();
    });

    expect(screen.getByText("deliveryMethod")).toBeInTheDocument();
    expect(screen.getByText("ghnDelivery")).toBeInTheDocument();
    expect(screen.getByText("shipmentStatus")).toBeInTheDocument();
    expect(screen.getByText("shipmentStatusDelivering")).toBeInTheDocument();
  });
});
