import type {
  ApiCreateShippingQuoteRequest,
  ApiShippingQuote,
} from "@/types/api";
import type {
  DeliveryInfo,
  DeliveryMethod,
  ShipmentStatus,
  ShippingQuoteSnapshot,
} from "@/types";
import {
  CANCELLABLE_SHIPMENT_STATUSES,
  createEmptyShippingAddress,
  type ShipmentStatusTone,
} from "./types";

function normalizeString(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

export function toDeliveryProfileInput(delivery: DeliveryInfo) {
  return {
    fullName: normalizeString(delivery.fullName),
    phoneNumber: normalizeString(delivery.phoneNumber),
    address: normalizeString(delivery.address),
    provinceId: delivery.provinceId ?? null,
    provinceName: normalizeString(delivery.provinceName) || null,
    districtId: delivery.districtId ?? null,
    districtName: normalizeString(delivery.districtName) || null,
    wardCode: normalizeString(delivery.wardCode) || null,
    wardName: normalizeString(delivery.wardName) || null,
  };
}

export function fromDeliveryProfileInput(
  profile: Partial<DeliveryInfo> | null | undefined
): DeliveryInfo {
  if (!profile) {
    return createEmptyShippingAddress();
  }

  return {
    fullName: normalizeString(profile.fullName),
    phoneNumber: normalizeString(profile.phoneNumber),
    address: normalizeString(profile.address),
    provinceId: profile.provinceId ?? null,
    provinceName: normalizeString(profile.provinceName) || null,
    districtId: profile.districtId ?? null,
    districtName: normalizeString(profile.districtName) || null,
    wardCode: normalizeString(profile.wardCode) || null,
    wardName: normalizeString(profile.wardName) || null,
  };
}

export function buildShippingQuoteRequest(input: {
  deliveryMethod: DeliveryMethod;
  paymentMethod: "COD" | "STRIPE";
  delivery: DeliveryInfo;
  selectedServiceId?: number | null;
}): ApiCreateShippingQuoteRequest {
  const delivery = fromDeliveryProfileInput(input.delivery);

  if (!delivery.provinceId || !delivery.districtId || !delivery.wardCode) {
    throw new Error("Structured delivery address is required.");
  }

  return {
    deliveryMethod: input.deliveryMethod,
    paymentMethod: input.paymentMethod,
    address: {
      fullName: delivery.fullName,
      phoneNumber: delivery.phoneNumber,
      addressLine: delivery.address,
      provinceId: delivery.provinceId,
      provinceName: delivery.provinceName ?? "",
      districtId: delivery.districtId,
      districtName: delivery.districtName ?? "",
      wardCode: delivery.wardCode,
      wardName: delivery.wardName ?? "",
    },
    selectedServiceId: input.selectedServiceId ?? undefined,
  };
}

export function buildShippingQuoteSnapshot(
  quote: ApiShippingQuote
): ShippingQuoteSnapshot {
  return {
    shippingQuoteFingerprint: quote.quoteFingerprint,
    shippingServiceId: quote.service.serviceId,
    shippingServiceTypeId: quote.service.serviceTypeId,
    shippingServiceLabel: quote.service.displayName,
    shippingFee: quote.feeBreakdown.totalFee,
    shippingQuoteExpiresAt: quote.quoteExpiresAt,
    shippingProviderEnvironment: quote.environment,
  };
}

export function isQuoteExpired(
  quote: Pick<ApiShippingQuote, "quoteExpiresAt"> | null | undefined
): boolean {
  if (!quote?.quoteExpiresAt) {
    return true;
  }

  const expiresAt = new Date(quote.quoteExpiresAt).getTime();
  if (Number.isNaN(expiresAt)) {
    return true;
  }

  return expiresAt <= Date.now();
}

export function hasStructuredDeliveryAddress(delivery: DeliveryInfo): boolean {
  return Boolean(
    normalizeString(delivery.fullName) &&
      normalizeString(delivery.phoneNumber) &&
      normalizeString(delivery.address) &&
      delivery.provinceId &&
      normalizeString(delivery.provinceName) &&
      delivery.districtId &&
      normalizeString(delivery.districtName) &&
      normalizeString(delivery.wardCode) &&
      normalizeString(delivery.wardName)
  );
}

export function shouldInvalidateQuote(previous: DeliveryInfo, next: DeliveryInfo): boolean {
  return (
    normalizeString(previous.address) !== normalizeString(next.address) ||
    previous.provinceId !== next.provinceId ||
    normalizeString(previous.provinceName) !== normalizeString(next.provinceName) ||
    previous.districtId !== next.districtId ||
    normalizeString(previous.districtName) !== normalizeString(next.districtName) ||
    normalizeString(previous.wardCode) !== normalizeString(next.wardCode) ||
    normalizeString(previous.wardName) !== normalizeString(next.wardName)
  );
}

export function getShipmentStatusTone(
  status: ShipmentStatus | null | undefined
): ShipmentStatusTone {
  switch (status) {
    case "FAILED_TO_CREATE":
    case "SYNC_ERROR":
    case "DELIVERY_FAILED":
      return {
        badgeVariant: "error",
        isPending: false,
        isActive: false,
        isClosed: false,
        isRecoverable: true,
      };
    case "DELIVERED":
      return {
        badgeVariant: "success",
        isPending: false,
        isActive: false,
        isClosed: true,
        isRecoverable: false,
      };
    case "CANCELLED":
    case "RETURNED":
      return {
        badgeVariant: "default",
        isPending: false,
        isActive: false,
        isClosed: true,
        isRecoverable: false,
      };
    case "DELIVERING":
      return {
        badgeVariant: "info",
        isPending: false,
        isActive: true,
        isClosed: false,
        isRecoverable: false,
      };
    case "QUOTE_PENDING":
    case "QUOTED":
    case "CREATE_PENDING":
    case "CREATED":
    case "READY_TO_PICK":
    case "PICKING":
    case "PICKED":
    case "STORING":
    case "TRANSPORTING":
    case "SORTING":
      return {
        badgeVariant: "warning",
        isPending: true,
        isActive: true,
        isClosed: false,
        isRecoverable: false,
      };
    case "RETURNING":
      return {
        badgeVariant: "warning",
        isPending: false,
        isActive: true,
        isClosed: false,
        isRecoverable: true,
      };
    case "NOT_REQUIRED":
    default:
      return {
        badgeVariant: "default",
        isPending: false,
        isActive: false,
        isClosed: false,
        isRecoverable: false,
      };
  }
}

export function getShipmentStatusLabelKey(
  status: ShipmentStatus | null | undefined
): string {
  switch (status) {
    case "NOT_REQUIRED":
      return "shipmentStatusNotRequired";
    case "QUOTE_PENDING":
      return "shipmentStatusQuotePending";
    case "QUOTED":
      return "shipmentStatusQuoted";
    case "CREATE_PENDING":
      return "shipmentStatusCreatePending";
    case "CREATED":
      return "shipmentStatusCreated";
    case "READY_TO_PICK":
      return "shipmentStatusReadyToPick";
    case "PICKING":
      return "shipmentStatusPicking";
    case "PICKED":
      return "shipmentStatusPicked";
    case "STORING":
      return "shipmentStatusStoring";
    case "TRANSPORTING":
      return "shipmentStatusTransporting";
    case "SORTING":
      return "shipmentStatusSorting";
    case "DELIVERING":
      return "shipmentStatusDelivering";
    case "DELIVERED":
      return "shipmentStatusDelivered";
    case "CANCELLED":
      return "shipmentStatusCancelled";
    case "DELIVERY_FAILED":
      return "shipmentStatusDeliveryFailed";
    case "RETURNING":
      return "shipmentStatusReturning";
    case "RETURNED":
      return "shipmentStatusReturned";
    case "FAILED_TO_CREATE":
      return "shipmentStatusFailedToCreate";
    case "SYNC_ERROR":
      return "shipmentStatusSyncError";
    default:
      return "shipmentStatusUnknown";
  }
}

export function isShipmentCancellable(status: ShipmentStatus | null | undefined): boolean {
  return Boolean(status && CANCELLABLE_SHIPMENT_STATUSES.includes(status));
}

export function getDeliveryMethodLabelKey(
  deliveryMethod: DeliveryMethod | null | undefined
): "pickup" | "ghnDelivery" {
  return deliveryMethod === "GHN_DELIVERY" ? "ghnDelivery" : "pickup";
}

export function buildCartShippingFingerprint(
  items: Array<{ productId: string; variantId?: string | null; quantity: number }>
): string {
  return JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: item.quantity,
    }))
  );
}
