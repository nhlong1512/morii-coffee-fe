import type { PaymentMethod, PaymentStatus } from "@/types";

export const PENDING_STRIPE_CHECKOUT_DRAFT_STORAGE_KEY =
  "morii.pendingStripeCheckoutDraftId";

export function getPaymentMethodLabelKey(
  method: PaymentMethod | null | undefined
): "cod" | "momo" | "paypal" | "stripe" | "vnpay" {
  switch (method) {
    case "MOMO":
      return "momo";
    case "PAYPAL":
      return "paypal";
    case "STRIPE":
      return "stripe";
    case "VNPAY":
      return "vnpay";
    case "COD":
    default:
      return "cod";
  }
}

export function getPaymentStatusVariant(
  status: PaymentStatus | null | undefined
): "success" | "warning" | "info" | "error" | "default" {
  switch (status) {
    case "Paid":
      return "success";
    case "Pending":
      return "warning";
    case "PartiallyRefunded":
      return "info";
    case "Failed":
    case "Refunded":
      return "error";
    case "NotRequired":
    default:
      return "default";
  }
}

export function getPaymentStatusLabelKey(
  status: PaymentStatus | null | undefined
):
  | "paymentStatusNotRequired"
  | "paymentStatusPending"
  | "paymentStatusPaid"
  | "paymentStatusFailed"
  | "paymentStatusRefunded"
  | "paymentStatusPartiallyRefunded" {
  switch (status) {
    case "Pending":
      return "paymentStatusPending";
    case "Paid":
      return "paymentStatusPaid";
    case "Failed":
      return "paymentStatusFailed";
    case "Refunded":
      return "paymentStatusRefunded";
    case "PartiallyRefunded":
      return "paymentStatusPartiallyRefunded";
    case "NotRequired":
    default:
      return "paymentStatusNotRequired";
  }
}

export function getFallbackPaymentStatus(
  paymentMethod: PaymentMethod | null | undefined
): PaymentStatus | null {
  if (paymentMethod === "COD") {
    return "NotRequired";
  }

  return null;
}

export function isRefundablePaymentStatus(
  paymentStatus: PaymentStatus | null | undefined
) {
  return paymentStatus === "Paid" || paymentStatus === "PartiallyRefunded";
}
