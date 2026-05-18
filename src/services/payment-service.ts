import { apiGet, apiPost } from "@/lib/api";
import type {
  ApiCheckoutSessionResponse,
  ApiCreateCheckoutSessionRequest,
  ApiCreateRefundRequest,
  ApiOrderPaymentSummary,
  ApiRefundResponse,
  ApiStripeReconcileRequest,
  ApiStripeReconcileResponse,
} from "@/types/api";

export async function createCheckoutSession(
  orderId: string
): Promise<ApiCheckoutSessionResponse> {
  const payload: ApiCreateCheckoutSessionRequest = { orderId };
  return apiPost<ApiCheckoutSessionResponse>(
    "/v1/payments/stripe/checkout-session",
    payload
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
