import { renderHook, waitFor } from "@testing-library/react";
import { useOrders } from "@/hooks/use-orders";
import type { ApiAdminOrderSummary } from "@/types/api";

const getAdminOrdersMock = jest.fn();
const getOrderPaymentSummaryMock = jest.fn();

jest.mock("@/services/order-service", () => ({
  getAdminOrders: (...args: unknown[]) => getAdminOrdersMock(...args),
}));

jest.mock("@/services/payment-service", () => ({
  getOrderPaymentSummary: (...args: unknown[]) => getOrderPaymentSummaryMock(...args),
}));

const mockOrders: ApiAdminOrderSummary[] = [
  {
    id: "1",
    orderNumber: "MRC-20250310-001",
    createdAt: "2025-03-10T10:00:00Z",
    updatedAt: "2025-03-10T10:00:00Z",
    orderStatus: "PENDING",
    total: 100000,
    paymentMethod: "COD",
  },
  {
    id: "2",
    orderNumber: "MRC-20250311-002",
    createdAt: "2025-03-11T10:00:00Z",
    updatedAt: "2025-03-11T10:00:00Z",
    orderStatus: "DELIVERED",
    total: 200000,
    paymentMethod: "MOMO",
  },
  {
    id: "3",
    orderNumber: "MRC-20250312-003",
    createdAt: "2025-03-12T10:00:00Z",
    updatedAt: "2025-03-12T10:00:00Z",
    orderStatus: "PENDING",
    total: 150000,
    paymentMethod: "COD",
  },
];

beforeEach(() => {
  getAdminOrdersMock.mockReset();
  getOrderPaymentSummaryMock.mockReset();
  getAdminOrdersMock.mockResolvedValue(mockOrders);
  getOrderPaymentSummaryMock.mockImplementation(async (orderId: string) => ({
    orderId,
    paymentStatus: orderId === "2" ? "Paid" : "NotRequired",
    payments: [],
  }));
});

describe("useOrders", () => {
  it("starts in loading state", () => {
    const { result } = renderHook(() => useOrders());
    expect(result.current.loading).toBe(true);
    expect(result.current.orders).toHaveLength(0);
    expect(result.current.error).toBeNull();
  });

  it("returns all orders after fetch resolves", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.orders).toHaveLength(mockOrders.length);
    expect(result.current.error).toBeNull();
    expect(result.current.orders[0]?.paymentStatus).toBe("NotRequired");
  });

  it("calls getAdminOrders with no status when no filter is provided", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getAdminOrdersMock).toHaveBeenCalledWith({ status: undefined });
  });

  it("skips payment-summary fetches for COD orders", async () => {
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getOrderPaymentSummaryMock).toHaveBeenCalledTimes(1);
    expect(getOrderPaymentSummaryMock).toHaveBeenCalledWith("2");
    expect(result.current.orders[0]?.paymentStatus).toBe("NotRequired");
    expect(result.current.orders[2]?.paymentStatus).toBe("NotRequired");
  });

  describe("search filter", () => {
    it("filters by orderNumber (case-insensitive)", async () => {
      const { result } = renderHook(() => useOrders({ search: "mrc-20250310" }));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].orderNumber).toBe("MRC-20250310-001");
    });

    it("returns empty array when search matches nothing", async () => {
      const { result } = renderHook(() => useOrders({ search: "ZZZNOMATCH" }));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.orders).toHaveLength(0);
    });
  });

  describe("orderStatus filter", () => {
    it("passes status to getAdminOrders for server-side filtering", async () => {
      const { result } = renderHook(() => useOrders({ orderStatus: "PENDING" }));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(getAdminOrdersMock).toHaveBeenCalledWith({ status: "PENDING" });
    });

    it("passes undefined status when orderStatus is 'all'", async () => {
      const { result } = renderHook(() => useOrders({ orderStatus: "all" }));
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(getAdminOrdersMock).toHaveBeenCalledWith({ status: undefined });
    });
  });

  describe("error state", () => {
    it("sets error when getAdminOrders rejects", async () => {
      getAdminOrdersMock.mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useOrders());
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.error).toBe("Network error");
      expect(result.current.orders).toHaveLength(0);
    });
  });
});
