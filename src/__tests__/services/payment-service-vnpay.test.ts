import { createVnpayPaymentUrl, reconcileVnpayPayment } from '@/services/payment-service';
import type {
  ApiCreateVnpayPaymentUrlRequest,
  ApiCreateVnpayPaymentUrlResponse,
  ApiReconcileVnpayPaymentResponse,
} from '@/types/api';

// Mock apiFetch
jest.mock('@/lib/api', () => ({
  apiPost: jest.fn(),
}));

import { apiPost } from '@/lib/api';

const mockApiPost = apiPost as jest.MockedFunction<typeof apiPost>;

describe('Payment Service - VNPAY', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createVnpayPaymentUrl', () => {
    it('should call POST /v1/payments/vnpay/payment-url with request data', async () => {
      const request: ApiCreateVnpayPaymentUrlRequest = {
        deliveryProvinceName: 'Hồ Chí Minh',
        deliveryDistrictName: 'Quận 1',
        deliveryWardName: 'Phường Bến Nghé',
        deliveryAddressDetail: '123 Nguyễn Huệ',
        deliveryPhoneNumber: '0901234567',
        shippingProviderId: 1,
        expectedDeliveryDate: '2026-06-20',
        serviceId: 1,
      };

      const response: ApiCreateVnpayPaymentUrlResponse = {
        paymentUrl: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=125000&...',
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
        amount: 125000,
        currency: 'VND',
        expiresAtUtc: '2026-06-15T10:30:00Z',
      };

      mockApiPost.mockResolvedValue(response);

      const result = await createVnpayPaymentUrl(request);

      expect(mockApiPost).toHaveBeenCalledWith('/v1/payments/vnpay/payment-url', request);
      expect(result).toEqual(response);
      expect(result.paymentUrl).toMatch(/^https:\/\/(sandbox\.)?vnpayment\.vn/);
      expect(result.amount).toBeGreaterThan(0);
    });

    it('should throw error on API failure', async () => {
      const request: ApiCreateVnpayPaymentUrlRequest = {
        deliveryProvinceName: 'Hồ Chí Minh',
        deliveryDistrictName: 'Quận 1',
        deliveryWardName: 'Phường Bến Nghé',
        deliveryAddressDetail: '123 Nguyễn Huệ',
        deliveryPhoneNumber: '0901234567',
        shippingProviderId: 1,
        expectedDeliveryDate: '2026-06-20',
        serviceId: 1,
      };

      const error = new Error('Could not create payment URL');
      mockApiPost.mockRejectedValue(error);

      await expect(createVnpayPaymentUrl(request)).rejects.toThrow('Could not create payment URL');
    });
  });

  describe('reconcileVnpayPayment', () => {
    it('should return Paid status with orderId when payment confirmed', async () => {
      const request = {
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
      };

      const response: ApiReconcileVnpayPaymentResponse = {
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
        orderId: '7d18b2cd-2eb0-45a3-953a-bb890f11e746',
        orderNumber: 'MRC-20260615-0001',
        paymentStatus: 'Paid',
        failureReason: null,
        expiresAtUtc: '2026-06-15T10:30:00Z',
      };

      mockApiPost.mockResolvedValue(response);

      const result = await reconcileVnpayPayment(request);

      expect(mockApiPost).toHaveBeenCalledWith('/v1/payments/vnpay/reconcile', request);
      expect(result.paymentStatus).toBe('Paid');
      expect(result.orderId).toBeDefined();
      expect(result.orderNumber).toBeDefined();
    });

    it('should return null paymentStatus when still pending', async () => {
      const request = {
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
      };

      const response: ApiReconcileVnpayPaymentResponse = {
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
        orderId: null,
        orderNumber: null,
        paymentStatus: null,
        failureReason: null,
        expiresAtUtc: '2026-06-15T10:30:00Z',
      };

      mockApiPost.mockResolvedValue(response);

      const result = await reconcileVnpayPayment(request);

      expect(result.paymentStatus).toBeNull();
      expect(result.orderId).toBeNull();
    });

    it('should return Failed status with reason when payment failed', async () => {
      const request = {
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
      };

      const response: ApiReconcileVnpayPaymentResponse = {
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
        orderId: null,
        orderNumber: null,
        paymentStatus: 'Failed',
        failureReason: 'Insufficient funds',
        expiresAtUtc: '2026-06-15T10:30:00Z',
      };

      mockApiPost.mockResolvedValue(response);

      const result = await reconcileVnpayPayment(request);

      expect(result.paymentStatus).toBe('Failed');
      expect(result.failureReason).toBe('Insufficient funds');
    });

    it('should throw error on API failure', async () => {
      const request = {
        checkoutDraftId: 'd5c26720-14e9-4ba8-bd10-cf737bb01a99',
        txnRef: 'd5c2672014e94ba8bd10cf737bb01a99',
      };

      const error = new Error('Draft not found');
      mockApiPost.mockRejectedValue(error);

      await expect(reconcileVnpayPayment(request)).rejects.toThrow('Draft not found');
    });
  });
});
