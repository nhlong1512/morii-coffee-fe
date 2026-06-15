import { apiGet, apiPost } from "@/lib/api";
import type {
  ApiCheckoutSessionResponse,
  ApiCreateCheckoutSessionRequest,
  ApiCreateRefundRequest,
  ApiCreateVnpayPaymentUrlRequest,
  ApiCreateVnpayPaymentUrlResponse,
  ApiOrderPaymentSummary,
  ApiReconcileVnpayPaymentRequest,
  ApiReconcileVnpayPaymentResponse,
  ApiRefundReconcileResponse,
  ApiRefundResponse,
  ApiStripeReconcileRequest,
  ApiStripeReconcileResponse,
} from "@/types/api";

export async function createCheckoutSession(
  request: ApiCreateCheckoutSessionRequest
): Promise<ApiCheckoutSessionResponse> {
  return apiPost<ApiCheckoutSessionResponse>(
    "/v1/payments/stripe/checkout-session",
    request
  );
}

export async function getOrderPaymentSummary(
  orderId: string
): Promise<ApiOrderPaymentSummary | null> {
  try {
    return await apiGet<ApiOrderPaymentSummary>(`/v1/payments/by-order/${orderId}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

export async function reconcileStripePayment(
  request: ApiStripeReconcileRequest
): Promise<ApiStripeReconcileResponse> {
  return apiPost<ApiStripeReconcileResponse>("/v1/payments/stripe/reconcile", request);
}

export async function refundOrderPayment(
  orderId: string,
  request: ApiCreateRefundRequest
): Promise<ApiRefundResponse> {
  return apiPost<ApiRefundResponse>(`/v1/payments/${orderId}/refund`, request);
}

export async function reconcileOrderRefund(
  orderId: string
): Promise<ApiRefundReconcileResponse> {
  return apiPost<ApiRefundReconcileResponse>(
    `/v1/payments/${orderId}/refund/reconcile`,
    {}
  );
}

export async function createVnpayPaymentUrl(
  request: ApiCreateVnpayPaymentUrlRequest
): Promise<ApiCreateVnpayPaymentUrlResponse> {
  return apiPost<ApiCreateVnpayPaymentUrlResponse>(
    "/v1/payments/vnpay/payment-url",
    request
  );
}

export async function reconcileVnpayPayment(
  request: ApiReconcileVnpayPaymentRequest
): Promise<ApiReconcileVnpayPaymentResponse> {
  return apiPost<ApiReconcileVnpayPaymentResponse>(
    "/v1/payments/vnpay/reconcile",
    request
  );
}
