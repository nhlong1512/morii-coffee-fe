import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminOrderDetailPage from "@/app/admin/orders/[id]/page";

const getAdminOrderByIdMock = jest.fn();
const getValidOrderStatusesMock = jest.fn();
const updateOrderStatusMock = jest.fn();
const getOrderPaymentSummaryMock = jest.fn();
const refundOrderPaymentMock = jest.fn();
const reconcileOrderRefundMock = jest.fn();
const runShipmentActionMock = jest.fn();

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

jest.mock("@/features/shipping", () => ({
  ShipmentSummaryCard: ({
    emptyTitle,
    shipment,
  }: {
    emptyTitle: string;
    shipment: { statusLabel: string } | null;
  }) => <div>{shipment ? shipment.statusLabel : emptyTitle}</div>,
  getShipmentStatusTone: () => ({ badgeVariant: "warning" }),
  isShipmentCancellable: () => true,
  useShipmentSummary: () => ({
    shipment: null,
    loading: false,
    setShipment: jest.fn(),
  }),
  useShipmentActions: () => ({
    isSubmitting: false,
    actionError: null,
    actionMessage: null,
    runAction: (...args: unknown[]) => runShipmentActionMock(...args),
  }),
}));

jest.mock("@/services/order-service", () => ({
  getAdminOrderById: (...args: unknown[]) => getAdminOrderByIdMock(...args),
  getValidOrderStatuses: (...args: unknown[]) => getValidOrderStatusesMock(...args),
  updateOrderStatus: (...args: unknown[]) => updateOrderStatusMock(...args),
}));

jest.mock("@/services/payment-service", () => ({
  getOrderPaymentSummary: (...args: unknown[]) => getOrderPaymentSummaryMock(...args),
  refundOrderPayment: (...args: unknown[]) => refundOrderPaymentMock(...args),
  reconcileOrderRefund: (...args: unknown[]) => reconcileOrderRefundMock(...args),
}));

describe("AdminOrderDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getAdminOrderByIdMock.mockResolvedValue({
      id: "order-1",
      orderNumber: "MRC-1",
      userId: "user-1",
      createdAt: "2026-05-24T10:00:00Z",
      updatedAt: "2026-05-24T10:00:00Z",
      orderStatus: "CONFIRMED",
      items: [],
      deliveryFullName: "Nguyen Van A",
      deliveryPhoneNumber: "0901234567",
      deliveryAddress: "237/65 Pham Van Chieu",
      notes: "Please call first",
      paymentMethod: "COD",
      deliveryMethod: "GHN_DELIVERY",
      subtotal: 98000,
      tax: 9800,
      shipping: 20900,
      discount: 0,
      total: 128700,
      trackingNumber: null,
      paymentInfo: null,
      shipment: null,
      shipmentStatus: "FAILED_TO_CREATE",
      shipmentStatusLabel: "failed_to_create",
    });
    getOrderPaymentSummaryMock.mockResolvedValue(null);
    getValidOrderStatusesMock.mockResolvedValue([]);
    updateOrderStatusMock.mockResolvedValue([]);
    refundOrderPaymentMock.mockResolvedValue(undefined);
    reconcileOrderRefundMock.mockResolvedValue(undefined);
    runShipmentActionMock.mockResolvedValue({ shipment: null, message: "ok" });
  });

  it("renders shipment controls and triggers a create action", async () => {
    render(<AdminOrderDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Shipment Management")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Create shipment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sync shipment" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Requote shipment" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Create shipment" }));

    await waitFor(() => {
      expect(runShipmentActionMock).toHaveBeenCalledWith("create", undefined);
    });
  });
});
