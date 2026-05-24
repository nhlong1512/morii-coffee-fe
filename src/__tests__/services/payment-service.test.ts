import type {
  ApiCheckoutSessionResponse,
  ApiOrderPaymentSummary,
  ApiRefundReconcileResponse,
  ApiRefundResponse,
  ApiStripeReconcileResponse,
} from "@/types/api";

const apiGetMock = jest.fn();
const apiPostMock = jest.fn();

jest.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPost: (...args: unknown[]) => apiPostMock(...args),
}));

beforeEach(() => {
  jest.resetModules();
  apiGetMock.mockReset();
  apiPostMock.mockReset();
});

describe("payment-service", () => {
  describe("createCheckoutSession", () => {
    it("creates a stripe checkout session from checkout delivery info", async () => {
      const response: ApiCheckoutSessionResponse = {
        sessionId: "cs_test_123",
        checkoutUrl: "https://checkout.stripe.com/pay/cs_test_123",
        expiresAtUtc: "2026-05-19T14:30:00Z",
        checkoutDraftId: "draft-1",
        amount: 250000,
        currency: "vnd",
        publishableKey: "pk_test_123",
      };
      apiPostMock.mockResolvedValue(response);

      const { createCheckoutSession } = await import("@/services/payment-service");
      const result = await createCheckoutSession({
        fullName: "Nguyen Huu Long",
        phoneNumber: "0775504619",
        address: "1170/61 3 Thang 2, District 11",
        provinceId: 202,
        provinceName: "Ho Chi Minh",
        districtId: 1444,
        districtName: "District 11",
        wardCode: "00123",
        wardName: "Ward 14",
        notes: "Less ice",
        saveDeliveryProfile: true,
        deliveryMethod: "GHN_DELIVERY",
        shippingQuoteFingerprint: "quote-1",
        shippingServiceId: 53320,
        shippingServiceTypeId: 2,
        shippingServiceLabel: "GHN Hang nhe",
        shippingFee: 20900,
        shippingQuoteExpiresAt: "2026-05-24T14:00:00Z",
        shippingProviderEnvironment: "sandbox",
      });

      expect(apiPostMock).toHaveBeenCalledWith(
        "/v1/payments/stripe/checkout-session",
        {
          fullName: "Nguyen Huu Long",
          phoneNumber: "0775504619",
          address: "1170/61 3 Thang 2, District 11",
          provinceId: 202,
          provinceName: "Ho Chi Minh",
          districtId: 1444,
          districtName: "District 11",
          wardCode: "00123",
          wardName: "Ward 14",
          notes: "Less ice",
          saveDeliveryProfile: true,
          deliveryMethod: "GHN_DELIVERY",
          shippingQuoteFingerprint: "quote-1",
          shippingServiceId: 53320,
          shippingServiceTypeId: 2,
          shippingServiceLabel: "GHN Hang nhe",
          shippingFee: 20900,
          shippingQuoteExpiresAt: "2026-05-24T14:00:00Z",
          shippingProviderEnvironment: "sandbox",
        }
      );
      expect(result).toEqual(response);
    });
  });

  describe("getOrderPaymentSummary", () => {
    it("returns payment summary data for an order", async () => {
      const response: ApiOrderPaymentSummary = {
        orderId: "order-1",
        paymentStatus: "Paid",
        payments: [
          {
            id: "payment-1",
            stripeSessionId: "cs_test_123",
            stripePaymentIntentId: "pi_test_123",
            amount: 250000,
            currency: "vnd",
            status: "Succeeded",
            failureReason: null,
            createdAt: "2026-05-18T14:00:00Z",
            refunds: null,
          },
        ],
      };
      apiGetMock.mockResolvedValue(response);

      const { getOrderPaymentSummary } = await import("@/services/payment-service");
      const summary = await getOrderPaymentSummary("order-1");

      expect(apiGetMock).toHaveBeenCalledWith("/v1/payments/by-order/order-1");
      expect(summary).toEqual(response);
    });

    it("returns null for missing payment summaries", async () => {
      apiGetMock.mockRejectedValue(new Error("API 404: Not Found"));

      const { getOrderPaymentSummary } = await import("@/services/payment-service");
      const summary = await getOrderPaymentSummary("missing-order");

      expect(summary).toBeNull();
    });
  });

  describe("reconcileStripePayment", () => {
    it("posts the Stripe success return data for reconciliation", async () => {
      const response: ApiStripeReconcileResponse = {
        checkoutDraftId: "draft-1",
        sessionId: "cs_test_123",
        orderId: "order-1",
        orderNumber: "MRC-20260520-001",
        paymentStatus: "Paid",
        failureReason: null,
        expiresAtUtc: "2026-05-19T14:30:00Z",
      };
      apiPostMock.mockResolvedValue(response);

      const { reconcileStripePayment } = await import("@/services/payment-service");
      const result = await reconcileStripePayment({
        sessionId: "cs_test_123",
        checkoutDraftId: "draft-1",
      });

      expect(apiPostMock).toHaveBeenCalledWith("/v1/payments/stripe/reconcile", {
        sessionId: "cs_test_123",
        checkoutDraftId: "draft-1",
      });
      expect(result).toEqual(response);
    });
  });

  describe("refundOrderPayment", () => {
    it("posts refund payload and returns the backend response", async () => {
      const response: ApiRefundResponse = {
        refundId: "refund-1",
        stripeRefundId: "re_test_123",
        amount: 125000,
        status: "Pending",
        paymentStatus: "PartiallyRefunded",
      };
      apiPostMock.mockResolvedValue(response);

      const { refundOrderPayment } = await import("@/services/payment-service");
      const result = await refundOrderPayment("order-1", {
        amount: 125000,
        reason: "Customer requested cancellation",
      });

      expect(apiPostMock).toHaveBeenCalledWith("/v1/payments/order-1/refund", {
        amount: 125000,
        reason: "Customer requested cancellation",
      });
      expect(result).toEqual(response);
    });
  });

  describe("reconcileOrderRefund", () => {
    it("posts refund reconcile request and returns the backend response", async () => {
      const response: ApiRefundReconcileResponse = {
        orderId: "order-1",
        paymentStatus: "Refunded",
        latestRefundStatus: "Succeeded",
        reconciled: true,
        reconciledRefundCount: 1,
      };
      apiPostMock.mockResolvedValue(response);

      const { reconcileOrderRefund } = await import("@/services/payment-service");
      const result = await reconcileOrderRefund("order-1");

      expect(apiPostMock).toHaveBeenCalledWith(
        "/v1/payments/order-1/refund/reconcile",
        {}
      );
      expect(result).toEqual(response);
    });
  });
});
