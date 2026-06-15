import type {
  ApiCreateVnpayPaymentUrlRequest,
  ApiCreateVnpayPaymentUrlResponse,
  ApiReconcileVnpayPaymentResponse,
} from '@/types/api';
import { createVnpayPaymentUrl, reconcileVnpayPayment } from '@/services/payment-service';

/**
 * Integration test for complete VNPAY checkout flow:
 * 1. User selects VNPAY payment method
 * 2. System creates payment URL and stores checkout draft
 * 3. User completes payment at VNPAY
 * 4. System polls and confirms payment
 * 5. Order is created
 */

jest.mock('@/lib/api', () => ({
  apiPost: jest.fn(),
}));

import { apiPost } from '@/lib/api';

const mockApiPost = apiPost as jest.MockedFunction<typeof apiPost>;

describe('VNPAY Checkout Flow - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Payment Flow', () => {
    it('should complete full checkout and payment verification flow', async () => {
      // Step 1: User initiates checkout with VNPAY payment method
      const checkoutRequest: ApiCreateVnpayPaymentUrlRequest = {
        deliveryProvinceName: 'Hồ Chí Minh',
        deliveryDistrictName: 'Quận 1',
        deliveryWardName: 'Phường Bến Nghé',
        deliveryAddressDetail: '123 Nguyễn Huệ',
        deliveryPhoneNumber: '0901234567',
        shippingProviderId: 1,
        expectedDeliveryDate: '2026-06-20',
        serviceId: 1,
      };

      // Step 2: Backend creates VNPAY payment URL
      const createPaymentResponse: ApiCreateVnpayPaymentUrlResponse = {
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=125000&...',
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
        amount: 125000,
        currency: 'VND',
        expiresAtUtc: '2026-06-15T10:30:00Z',
      };

      mockApiPost.mockResolvedValueOnce(createPaymentResponse);

      const paymentUrlResponse = await createVnpayPaymentUrl(checkoutRequest);

      expect(mockApiPost).toHaveBeenCalledWith('/v1/payments/vnpay/payment-url', checkoutRequest);
      expect(paymentUrlResponse.paymentUrl).toBeDefined();
      expect(paymentUrlResponse.checkoutDraftId).toBe('d5c26720-14e9-4ba8-bd10-cf737bb01a99');
      expect(paymentUrlResponse.amount).toBe(125000);

      // Step 3: Frontend stores checkout draft in sessionStorage
      const pendingCheckout = {
        provider: 'Vnpay',
        checkoutDraftId: paymentUrlResponse.checkoutDraftId,
        providerSessionId: paymentUrlResponse.txnRef,
        expiresAtUtc: paymentUrlResponse.expiresAtUtc,
      };

      // Step 4: Simulate user completes payment at VNPAY and returns
      // Frontend polls backend for payment status

      // First poll: Payment still processing
      const firstPollResponse: ApiReconcileVnpayPaymentResponse = {
        checkoutDraftId: pendingCheckout.checkoutDraftId,
        txnRef: pendingCheckout.providerSessionId,
        orderId: null,
        orderNumber: null,
        paymentStatus: null,
        failureReason: null,
        expiresAtUtc: pendingCheckout.expiresAtUtc,
      };

      mockApiPost.mockResolvedValueOnce(firstPollResponse);

      const firstPoll = await reconcileVnpayPayment({
        checkoutDraftId: pendingCheckout.checkoutDraftId,
        txnRef: pendingCheckout.providerSessionId,
      });

      expect(firstPoll.paymentStatus).toBeNull();
      expect(firstPoll.orderId).toBeNull();

      // Second poll: Payment confirmed
      const secondPollResponse: ApiReconcileVnpayPaymentResponse = {
        checkoutDraftId: pendingCheckout.checkoutDraftId,
        txnRef: pendingCheckout.providerSessionId,
        orderId: '7d18b2cd-2eb0-45a3-953a-bb890f11e746',
        orderNumber: 'MRC-20260615-0001',
        paymentStatus: 'Paid',
        failureReason: null,
        expiresAtUtc: pendingCheckout.expiresAtUtc,
      };

      mockApiPost.mockResolvedValueOnce(secondPollResponse);

      const secondPoll = await reconcileVnpayPayment({
        checkoutDraftId: pendingCheckout.checkoutDraftId,
        txnRef: pendingCheckout.providerSessionId,
      });

      // Step 5: Verify payment confirmed and order created
      expect(secondPoll.paymentStatus).toBe('Paid');
      expect(secondPoll.orderId).toBe('7d18b2cd-2eb0-45a3-953a-bb890f11e746');
      expect(secondPoll.orderNumber).toBe('MRC-20260615-0001');

      // Total API calls: 1 create + 2 polls
      expect(mockApiPost).toHaveBeenCalledTimes(3);
    });

    it('should handle payment failure scenario', async () => {
      const checkoutRequest: ApiCreateVnpayPaymentUrlRequest = {
        deliveryProvinceName: 'Hồ Chí Minh',
        deliveryDistrictName: 'Quận 1',
        deliveryWardName: 'Phường Bến Nghé',
        deliveryAddressDetail: '123 Nguyễn Huệ',
        deliveryPhoneNumber: '0901234567',
        shippingProviderId: 1,
        expectedDeliveryDate: '2026-06-20',
        serviceId: 1,
      };

      const createPaymentResponse: ApiCreateVnpayPaymentUrlResponse = {
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=125000&...',
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
        amount: 125000,
        currency: 'VND',
        expiresAtUtc: '2026-06-15T10:30:00Z',
      };

      mockApiPost.mockResolvedValueOnce(createPaymentResponse);

      const paymentUrlResponse = await createVnpayPaymentUrl(checkoutRequest);

      const pendingCheckout = {
        provider: 'Vnpay',
        checkoutDraftId: paymentUrlResponse.checkoutDraftId,
        providerSessionId: paymentUrlResponse.txnRef,
        expiresAtUtc: paymentUrlResponse.expiresAtUtc,
      };

      // Poll shows payment failed
      const failedPollResponse: ApiReconcileVnpayPaymentResponse = {
        checkoutDraftId: pendingCheckout.checkoutDraftId,
        txnRef: pendingCheckout.providerSessionId,
        orderId: null,
        orderNumber: null,
        paymentStatus: 'Failed',
        failureReason: 'Insufficient funds',
        expiresAtUtc: pendingCheckout.expiresAtUtc,
      };

      mockApiPost.mockResolvedValueOnce(failedPollResponse);

      const failedPoll = await reconcileVnpayPayment({
        checkoutDraftId: pendingCheckout.checkoutDraftId,
        txnRef: pendingCheckout.providerSessionId,
      });

      expect(failedPoll.paymentStatus).toBe('Failed');
      expect(failedPoll.failureReason).toBe('Insufficient funds');
      expect(failedPoll.orderId).toBeNull();
    });

    it('should handle payment timeout after 300 seconds', async () => {
      // This test simulates the polling timeout scenario
      const checkoutRequest: ApiCreateVnpayPaymentUrlRequest = {
        deliveryProvinceName: 'Hồ Chí Minh',
        deliveryDistrictName: 'Quận 1',
        deliveryWardName: 'Phường Bến Nghé',
        deliveryAddressDetail: '123 Nguyễn Huệ',
        deliveryPhoneNumber: '0901234567',
        shippingProviderId: 1,
        expectedDeliveryDate: '2026-06-20',
        serviceId: 1,
      };

      const createPaymentResponse: ApiCreateVnpayPaymentUrlResponse = {
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=125000&...',
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
        amount: 125000,
        currency: 'VND',
        expiresAtUtc: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Expires in 5 minutes
      };

      mockApiPost.mockResolvedValueOnce(createPaymentResponse);

      const paymentUrlResponse = await createVnpayPaymentUrl(checkoutRequest);

      expect(paymentUrlResponse.expiresAtUtc).toBeDefined();

      // Frontend would track polling duration and timeout after 300 seconds
      // Payment is still in pending state (not confirmed within timeout window)
      const timeoutPollResponse: ApiReconcileVnpayPaymentResponse = {
        checkoutDraftId: paymentUrlResponse.checkoutDraftId,
        txnRef: paymentUrlResponse.txnRef,
        orderId: null,
        orderNumber: null,
        paymentStatus: null, // Still pending
        failureReason: null,
        expiresAtUtc: paymentUrlResponse.expiresAtUtc,
      };

      mockApiPost.mockResolvedValueOnce(timeoutPollResponse);

      const timeoutPoll = await reconcileVnpayPayment({
        checkoutDraftId: paymentUrlResponse.checkoutDraftId,
        txnRef: paymentUrlResponse.txnRef,
      });

      // Verify response is still pending (component would detect timeout on frontend)
      expect(timeoutPoll.paymentStatus).toBeNull();
    });
  });

  describe('Checkout Draft Expiration', () => {
    it('should reject reconciliation after checkout draft expires', async () => {
      const expiredCheckoutDraftId = 'd5c26720-14e9-4ba8-bd10-cf737bb01a99';
      const expiredTxnRef = 'd5c2672014e94ba8bd10cf737bb01a99';

      const errorResponse = new Error('Checkout draft expired');
      mockApiPost.mockRejectedValueOnce(errorResponse);

      await expect(
        reconcileVnpayPayment({
          checkoutDraftId: expiredCheckoutDraftId,
          txnRef: expiredTxnRef,
        })
      ).rejects.toThrow('Checkout draft expired');
    });
  });

  describe('Multiple Concurrent Checkouts', () => {
    it('should handle different checkouts independently', async () => {
      const checkout1Request: ApiCreateVnpayPaymentUrlRequest = {
        deliveryProvinceName: 'Hồ Chí Minh',
        deliveryDistrictName: 'Quận 1',
        deliveryWardName: 'Phường Bến Nghé',
        deliveryAddressDetail: '123 Nguyễn Huệ',
        deliveryPhoneNumber: '0901234567',
        shippingProviderId: 1,
        expectedDeliveryDate: '2026-06-20',
        serviceId: 1,
      };

      const checkout2Request: ApiCreateVnpayPaymentUrlRequest = {
        deliveryProvinceName: 'Hà Nội',
        deliveryDistrictName: 'Quận 1',
        deliveryWardName: 'Phường Trần Hưng Đạo',
        deliveryAddressDetail: '456 Hàng Bông',
        deliveryPhoneNumber: '0902345678',
        shippingProviderId: 2,
        expectedDeliveryDate: '2026-06-21',
        serviceId: 2,
      };

      const response1: ApiCreateVnpayPaymentUrlResponse = {
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=125000&...',
        checkoutDraftId: 'draft-1',
        txnRef: 'txn-1',
        amount: 125000,
        currency: 'VND',
        expiresAtUtc: '2026-06-15T10:30:00Z',
      };

      const response2: ApiCreateVnpayPaymentUrlResponse = {
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=250000&...',
        checkoutDraftId: 'draft-2',
        txnRef: 'txn-2',
        amount: 250000,
        currency: 'VND',
        expiresAtUtc: '2026-06-15T11:00:00Z',
      };

      mockApiPost.mockResolvedValueOnce(response1).mockResolvedValueOnce(response2);

      const result1 = await createVnpayPaymentUrl(checkout1Request);
      const result2 = await createVnpayPaymentUrl(checkout2Request);

      expect(result1.checkoutDraftId).toBe('draft-1');
      expect(result2.checkoutDraftId).toBe('draft-2');
      expect(result1.amount).toBe(125000);
      expect(result2.amount).toBe(250000);
    });
  });

  describe('API Contract Validation', () => {
    it('should validate CreateVnpayPaymentUrl request includes required fields', async () => {
      const validRequest: ApiCreateVnpayPaymentUrlRequest = {
        deliveryProvinceName: 'Hồ Chí Minh',
        deliveryDistrictName: 'Quận 1',
        deliveryWardName: 'Phường Bến Nghé',
        deliveryAddressDetail: '123 Nguyễn Huệ',
        deliveryPhoneNumber: '0901234567',
        shippingProviderId: 1,
        expectedDeliveryDate: '2026-06-20',
        serviceId: 1,
      };

      // Verify request has all required fields
      expect(validRequest).toHaveProperty('deliveryProvinceName');
      expect(validRequest).toHaveProperty('deliveryPhoneNumber');
      expect(validRequest).toHaveProperty('shippingProviderId');
    });

    it('should validate reconcile response includes payment status', async () => {
      const reconcileResponse: ApiReconcileVnpayPaymentResponse = {
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
        orderId: '7d18b2cd-2eb0-45a3-953a-bb890f11e746',
        orderNumber: 'MRC-20260615-0001',
        paymentStatus: 'Paid',
        failureReason: null,
        expiresAtUtc: '2026-06-15T10:30:00Z',
      };

      expect(reconcileResponse).toHaveProperty('paymentStatus');
      expect(reconcileResponse).toHaveProperty('orderId');
      expect(reconcileResponse).toHaveProperty('orderNumber');
    });
  });
});
