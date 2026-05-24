import type { CreateOrderRequest } from "@/types";
import type {
  ApiCreateOrderRequest,
  ApiCreateOrderResponse,
  ApiOrderDetail,
  ApiOrderSummary,
  ApiPagination,
} from "@/types/api";

const apiGetMock = jest.fn();
const apiPatchMock = jest.fn();
const apiPostMock = jest.fn();

jest.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPatch: (...args: unknown[]) => apiPatchMock(...args),
  apiPost: (...args: unknown[]) => apiPostMock(...args),
}));

const makeRequest = (
  overrides?: Partial<CreateOrderRequest>
): CreateOrderRequest => ({
  fullName: "Charlie",
  phoneNumber: "0935000000",
  address: "3 New Ave",
  paymentMethod: "COD",
  notes: "Call before arrival",
  saveDeliveryProfile: true,
  provinceId: 202,
  provinceName: "Ho Chi Minh",
  districtId: 1461,
  districtName: "Go Vap",
  wardCode: "21310",
  wardName: "Ward 14",
  deliveryMethod: "GHN_DELIVERY",
  shippingQuoteFingerprint: "quote-1",
  shippingServiceId: 53320,
  shippingServiceTypeId: 2,
  shippingServiceLabel: "GHN Hang nhe",
  shippingFee: 20900,
  shippingQuoteExpiresAt: "2026-05-24T14:00:00Z",
  shippingProviderEnvironment: "sandbox",
  ...overrides,
});

beforeEach(() => {
  jest.resetModules();
  apiGetMock.mockReset();
  apiPatchMock.mockReset();
  apiPostMock.mockReset();
});

describe("order-service", () => {
  describe("createOrder", () => {
    it("posts create-order payload and returns the backend response", async () => {
      const response: ApiCreateOrderResponse = {
        id: "order-123",
        orderNumber: "MRC-20250310-003",
      };
      apiPostMock.mockResolvedValue(response);
      const request = makeRequest();
      const expectedPayload: ApiCreateOrderRequest = {
        fullName: request.fullName,
        phoneNumber: request.phoneNumber,
        address: request.address,
        paymentMethod: request.paymentMethod,
        notes: request.notes,
        saveDeliveryProfile: request.saveDeliveryProfile,
        provinceId: request.provinceId,
        provinceName: request.provinceName,
        districtId: request.districtId,
        districtName: request.districtName,
        wardCode: request.wardCode,
        wardName: request.wardName,
        deliveryMethod: request.deliveryMethod,
        shippingQuoteFingerprint: request.shippingQuoteFingerprint,
        shippingServiceId: request.shippingServiceId,
        shippingServiceTypeId: request.shippingServiceTypeId,
        shippingServiceLabel: request.shippingServiceLabel,
        shippingFee: request.shippingFee,
        shippingQuoteExpiresAt: request.shippingQuoteExpiresAt,
        shippingProviderEnvironment: request.shippingProviderEnvironment,
      };

      const { createOrder } = await import("@/services/order-service");
      const result = await createOrder(request);

      expect(apiPostMock).toHaveBeenCalledWith("/v1/orders", expectedPayload);
      expect(result).toEqual(response);
    });
  });

  describe("getOrders", () => {
    it("returns normalized paginated data when metadata is present", async () => {
      const response: ApiPagination<ApiOrderSummary> = {
        items: [
          {
            id: "order-2",
            orderNumber: "MRC-20250312-002",
            createdAt: "2025-03-12T10:00:00Z",
            orderStatus: "DELIVERED",
            total: 200000,
            itemCount: 2,
            firstProductName: "Latte",
          },
        ],
        metadata: {
          currentPage: 1,
          totalPages: 1,
          pageSize: 10,
          totalCount: 1,
          payloadSize: 1,
          hasPrevious: false,
          hasNext: false,
          takeAll: false,
        },
      };
      apiGetMock.mockResolvedValue(response);

      const { getOrders } = await import("@/services/order-service");
      const orders = await getOrders();

      expect(apiGetMock).toHaveBeenCalledWith("/v1/orders?page=1&pageSize=10");
      expect(orders).toEqual({
        ...response,
        items: [
          {
            ...response.items[0],
            deliveryMethod: "PICKUP",
            shippingProvider: null,
            shipmentStatus: null,
            shipmentStatusLabel: null,
          },
        ],
      });
    });

    it("synthesizes pagination metadata for legacy list responses", async () => {
      apiGetMock.mockResolvedValue({
        items: [
          {
            id: "order-1",
            orderNumber: "MRC-20250310-001",
            createdAt: "2025-03-10T10:00:00Z",
            orderStatus: "PENDING",
            total: 100000,
          },
        ],
        totalCount: 25,
        page: 2,
        pageSize: 10,
      });

      const { getOrders } = await import("@/services/order-service");
      const result = await getOrders({ page: 2, pageSize: 10 });

      expect(result.metadata.currentPage).toBe(2);
      expect(result.metadata.totalPages).toBe(3);
      expect(result.metadata.hasPrevious).toBe(true);
      expect(result.metadata.hasNext).toBe(true);
    });
  });

  describe("getOrderHistory", () => {
    it("uses the authenticated user's orders endpoint", async () => {
      const response: ApiOrderSummary[] = [
        {
          id: "order-2",
          orderNumber: "MRC-20250312-002",
          createdAt: "2025-03-12T10:00:00Z",
          orderStatus: "DELIVERED",
          total: 200000,
          itemCount: 2,
          firstProductName: "Latte",
        },
      ];
      apiGetMock.mockResolvedValue(response);

      const { getOrderHistory } = await import("@/services/order-service");
      const history = await getOrderHistory();

      expect(apiGetMock).toHaveBeenCalledWith("/v1/orders/my");
      expect(history).toEqual({
        items: [
          {
            ...response[0],
            deliveryMethod: "PICKUP",
            shippingProvider: null,
            shipmentStatus: null,
            shipmentStatusLabel: null,
          },
        ],
        hasNext: false,
        totalCount: 1,
      });
    });

    it("passes through the optional status filter", async () => {
      apiGetMock.mockResolvedValue([]);

      const { getOrderHistory } = await import("@/services/order-service");
      await getOrderHistory({ status: "DELIVERED" });

      expect(apiGetMock).toHaveBeenCalledWith("/v1/orders/my?status=DELIVERED");
    });

    it("derives item count and preview name from summary items when aggregate fields are missing", async () => {
      apiGetMock.mockResolvedValue([
        {
          id: "order-3",
          orderNumber: "MRC-20250313-003",
          createdAt: "2025-03-13T10:00:00Z",
          orderStatus: "PENDING",
          total: 150000,
          items: [
            { productName: "Cappuccino", quantity: 2 },
            { productName: "Croissant", quantity: 1 },
          ],
        },
      ]);

      const { getOrderHistory } = await import("@/services/order-service");
      const history = await getOrderHistory();

      expect(history.items[0]).toMatchObject({
        itemCount: 3,
        firstProductName: "Cappuccino",
      });
    });
  });

  describe("getOrderById", () => {
    it("maps backend detail payload to the storefront order shape", async () => {
      const response: ApiOrderDetail = {
        id: "existing-1",
        orderNumber: "MRC-20240101-1111",
        userId: "user-1",
        createdAt: "2024-01-15T08:00:00Z",
        updatedAt: "2024-01-15T08:00:00Z",
        orderStatus: "DELIVERED",
        items: [
          {
            id: "item-1",
            productId: "p1",
            productName: "Caramel Latte",
            variantId: "variant-1",
            variantLabel: "M",
            unitPrice: 55000,
            quantity: 2,
            lineTotal: 110000,
            imageUrl: "/images/latte.jpg",
          },
        ],
        deliveryFullName: "Alice",
        deliveryPhoneNumber: "0901234567",
        deliveryAddress: "1 Main St",
        provinceId: 202,
        provinceName: "Ho Chi Minh",
        districtId: 1461,
        districtName: "Go Vap",
        wardCode: "21310",
        wardName: "Ward 14",
        notes: null,
        paymentMethod: "COD",
        deliveryMethod: "GHN_DELIVERY",
        shippingProvider: "GHN",
        shippingQuoteFingerprint: "quote-1",
        shippingServiceId: 53320,
        shippingServiceTypeId: 2,
        shippingServiceLabel: "GHN Hang nhe",
        shippingQuoteExpiresAt: "2026-05-24T14:00:00Z",
        shipmentStatus: "DELIVERING",
        shipmentStatusLabel: "delivering",
        shipment: {
          id: "shipment-1",
          provider: "GHN",
          providerEnvironment: "sandbox",
          status: "DELIVERING",
          statusLabel: "delivering",
          clientOrderCode: "MORII-123",
          providerOrderCode: "LXVNAU",
          shopId: 200400,
          serviceId: 53320,
          serviceTypeId: 2,
          feeTotal: 15000,
          expectedDeliveryAt: "2026-05-25T16:59:59Z",
          trackingUrl: "https://donhang.ghn.vn/?order_code=LXVNAU",
          failureReasonCode: null,
          failureReason: null,
          note: "Please call first",
          lastSyncedAt: "2026-05-24T13:31:47Z",
        },
        subtotal: 110000,
        tax: 11000,
        shipping: 15000,
        discount: 0,
        total: 136000,
        trackingNumber: "TRK001",
        paymentInfo: {
          paymentStatus: "NotRequired",
          attemptCount: 0,
          latestPaymentId: null,
          latestAttemptStatus: null,
          stripeSessionId: null,
          stripePaymentIntentId: null,
          stripeChargeId: null,
          failureReason: null,
          latestAttemptCreatedAt: null,
        },
      };
      apiGetMock.mockResolvedValue(response);

      const { getOrderById } = await import("@/services/order-service");
      const order = await getOrderById("existing-1");

      expect(apiGetMock).toHaveBeenCalledWith("/v1/orders/existing-1");
      expect(order).toEqual({
        id: "existing-1",
        orderNumber: "MRC-20240101-1111",
        date: "2024-01-15T08:00:00Z",
        status: "DELIVERED",
        items: [
          {
            productId: "p1",
            variantId: "variant-1",
            name: "Caramel Latte",
            price: 55000,
            quantity: 2,
            size: "M",
            image: "/images/latte.jpg",
          },
        ],
        delivery: {
          fullName: "Alice",
          phoneNumber: "0901234567",
          address: "1 Main St",
          provinceId: 202,
          provinceName: "Ho Chi Minh",
          districtId: 1461,
          districtName: "Go Vap",
          wardCode: "21310",
          wardName: "Ward 14",
        },
        paymentMethod: "COD",
        subtotal: 110000,
        tax: 11000,
        shipping: 15000,
        discount: 0,
        total: 136000,
        trackingNumber: "TRK001",
        deliveryMethod: "GHN_DELIVERY",
        shippingProvider: "GHN",
        shippingQuoteSnapshot: {
          shippingQuoteFingerprint: "quote-1",
          shippingServiceId: 53320,
          shippingServiceTypeId: 2,
          shippingServiceLabel: "GHN Hang nhe",
          shippingFee: 15000,
          shippingQuoteExpiresAt: "2026-05-24T14:00:00Z",
          shippingProviderEnvironment: "",
        },
        shipmentStatus: "DELIVERING",
        shipmentStatusLabel: "delivering",
        shipment: {
          id: "shipment-1",
          provider: "GHN",
          providerEnvironment: "sandbox",
          status: "DELIVERING",
          statusLabel: "delivering",
          clientOrderCode: "MORII-123",
          providerOrderCode: "LXVNAU",
          shopId: 200400,
          serviceId: 53320,
          serviceTypeId: 2,
          feeTotal: 15000,
          expectedDeliveryAt: "2026-05-25T16:59:59Z",
          trackingUrl: "https://donhang.ghn.vn/?order_code=LXVNAU",
          failureReasonCode: null,
          failureReason: null,
          note: "Please call first",
          lastSyncedAt: "2026-05-24T13:31:47Z",
        },
        paymentInfo: {
          paymentStatus: "NotRequired",
          attemptCount: 0,
          latestPaymentId: null,
          latestAttemptStatus: null,
          stripeSessionId: null,
          stripePaymentIntentId: null,
          stripeChargeId: null,
          failureReason: null,
          latestAttemptCreatedAt: null,
        },
      });
    });

    it("maps flat delivery fields to the delivery object", async () => {
      const response: ApiOrderDetail = {
        id: "existing-2",
        orderNumber: "MRC-20240101-2222",
        userId: "user-2",
        createdAt: "2024-01-16T08:00:00Z",
        updatedAt: "2024-01-16T08:00:00Z",
        orderStatus: "CONFIRMED",
        items: [],
        deliveryFullName: "Bob",
        deliveryPhoneNumber: "0912345678",
        deliveryAddress: "2 Side St",
        provinceId: 201,
        provinceName: "Ha Noi",
        districtId: 123,
        districtName: "Ba Dinh",
        wardCode: "00001",
        wardName: "Ward 1",
        notes: null,
        paymentMethod: "COD",
        deliveryMethod: "PICKUP",
        subtotal: 100000,
        tax: 10000,
        shipping: 15000,
        discount: 0,
        total: 125000,
        trackingNumber: null,
        paymentInfo: {
          paymentStatus: "Paid",
          attemptCount: 2,
          latestPaymentId: "payment-2",
          latestAttemptStatus: "Succeeded",
          stripeSessionId: "cs_test_123",
          stripePaymentIntentId: "pi_test_123",
          stripeChargeId: "ch_test_123",
          failureReason: null,
          latestAttemptCreatedAt: "2026-05-18T14:00:00Z",
        },
      };
      apiGetMock.mockResolvedValue(response);

      const { getOrderById } = await import("@/services/order-service");
      const order = await getOrderById("existing-2");

      expect(order?.delivery).toEqual({
        fullName: "Bob",
        phoneNumber: "0912345678",
        address: "2 Side St",
        provinceId: 201,
        provinceName: "Ha Noi",
        districtId: 123,
        districtName: "Ba Dinh",
        wardCode: "00001",
        wardName: "Ward 1",
      });
      expect(order?.deliveryMethod).toBe("PICKUP");
      expect(order?.paymentInfo).toEqual({
        paymentStatus: "Paid",
        attemptCount: 2,
        latestPaymentId: "payment-2",
        latestAttemptStatus: "Succeeded",
        stripeSessionId: "cs_test_123",
        stripePaymentIntentId: "pi_test_123",
        stripeChargeId: "ch_test_123",
        failureReason: null,
        latestAttemptCreatedAt: "2026-05-18T14:00:00Z",
      });
    });

    it("returns null for 404 errors", async () => {
      apiGetMock.mockRejectedValue(new Error("API 404: Not Found"));

      const { getOrderById } = await import("@/services/order-service");
      const order = await getOrderById("does-not-exist");

      expect(order).toBeNull();
    });
  });

  describe("cancelOrder", () => {
    it("calls the cancel endpoint for the current order", async () => {
      apiPatchMock.mockResolvedValue(undefined);

      const { cancelOrder } = await import("@/services/order-service");
      await cancelOrder("existing-1");

      expect(apiPatchMock).toHaveBeenCalledWith("/v1/orders/existing-1/cancel");
    });
  });

  describe("getValidOrderStatuses", () => {
    it("returns valid next statuses for an order", async () => {
      apiGetMock.mockResolvedValue(["READY_TO_PICKUP", "IN_DELIVERY", "DELIVERED", "CANCELLED"]);

      const { getValidOrderStatuses } = await import("@/services/order-service");
      const statuses = await getValidOrderStatuses("order-1");

      expect(apiGetMock).toHaveBeenCalledWith("/v1/orders/order-1/valid-statuses");
      expect(statuses).toEqual(["READY_TO_PICKUP", "IN_DELIVERY", "DELIVERED", "CANCELLED"]);
    });

    it("returns an empty array for terminal-status orders", async () => {
      apiGetMock.mockResolvedValue([]);

      const { getValidOrderStatuses } = await import("@/services/order-service");
      const statuses = await getValidOrderStatuses("order-2");

      expect(statuses).toEqual([]);
    });
  });

  describe("updateOrderStatus", () => {
    it("PATCHes the status endpoint and returns the new valid statuses", async () => {
      const nextStatuses = ["IN_DELIVERY", "DELIVERED", "REVIEWED"];
      apiPatchMock.mockResolvedValue(nextStatuses);

      const { updateOrderStatus } = await import("@/services/order-service");
      const result = await updateOrderStatus("order-1", "READY_TO_PICKUP");

      expect(apiPatchMock).toHaveBeenCalledWith(
        "/v1/orders/order-1/status",
        { newStatus: "READY_TO_PICKUP" }
      );
      expect(result).toEqual(nextStatuses);
    });

    it("propagates errors thrown by the API", async () => {
      apiPatchMock.mockRejectedValue(new Error("API 400: Bad Request"));

      const { updateOrderStatus } = await import("@/services/order-service");
      await expect(updateOrderStatus("order-1", "INVALID")).rejects.toThrow("API 400");
    });
  });

});
