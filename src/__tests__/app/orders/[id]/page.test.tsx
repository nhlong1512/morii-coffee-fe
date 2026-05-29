import { render, screen, waitFor } from "@testing-library/react";
import OrderDetailPage from "@/app/orders/[id]/page";

const getOrderByIdMock = jest.fn();
const getOrderPaymentSummaryMock = jest.fn();
const cancelOrderMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "order-1" }),
}));

jest.mock("next/image", () => {
  function MockNextImage(props: Record<string, unknown>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={String(props.alt ?? "")} />;
  }

  return MockNextImage;
});

jest.mock("@/hooks/use-protected-route", () => ({
  useProtectedRoute: () => ({ isLoading: false }),
}));

jest.mock("@/features/shipping", () => ({
  useShipmentSummary: () => ({
    shipment: null,
    loading: false,
  }),
  ShipmentSummaryCard: ({
    title,
    emptyTitle,
    shipment,
  }: {
    title: string;
    emptyTitle: string;
    shipment: { statusLabel: string } | null;
  }) => <div>{shipment ? `${title}:${shipment.statusLabel}` : emptyTitle}</div>,
  getDeliveryMethodLabelKey: (value: string) =>
    value === "GHN_DELIVERY" ? "ghnDelivery" : "pickup",
}));

jest.mock("@/services/order-service", () => ({
  getOrderById: (...args: unknown[]) => getOrderByIdMock(...args),
  cancelOrder: (...args: unknown[]) => cancelOrderMock(...args),
}));

jest.mock("@/services/payment-service", () => ({
  getOrderPaymentSummary: (...args: unknown[]) => getOrderPaymentSummaryMock(...args),
}));

describe("OrderDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getOrderByIdMock.mockResolvedValue({
      id: "order-1",
      orderNumber: "MRC-1",
      date: "2026-05-24T10:00:00Z",
      status: "PENDING",
      items: [
        {
          productId: "product-1",
          variantId: "variant-1",
          name: "Latte",
          price: 49000,
          quantity: 2,
          size: "M",
          image: "/latte.png",
        },
      ],
      delivery: {
        fullName: "Nguyen Van A",
        phoneNumber: "0901234567",
        address: "237/65 Pham Van Chieu",
        provinceId: 202,
        provinceName: "Ho Chi Minh",
        districtId: 1461,
        districtName: "Go Vap",
        wardCode: "21310",
        wardName: "Ward 14",
      },
      paymentMethod: "COD",
      subtotal: 98000,
      tax: 9800,
      shipping: 20900,
      discount: 0,
      total: 128700,
      trackingNumber: null,
      paymentInfo: null,
      deliveryMethod: "GHN_DELIVERY",
      shippingProvider: "GHN",
      shippingQuoteSnapshot: null,
      shipmentStatus: null,
      shipmentStatusLabel: null,
      shipment: null,
    });
    getOrderPaymentSummaryMock.mockResolvedValue(null);
  });

  it("shows delivery method and pending shipment state", async () => {
    render(<OrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("MRC-1")).toBeInTheDocument();
    });

    expect(screen.getByText("deliveryMethod")).toBeInTheDocument();
    expect(screen.getByText("ghnDelivery")).toBeInTheDocument();
    expect(screen.getByText("shipmentPendingTitle")).toBeInTheDocument();
  });
});
