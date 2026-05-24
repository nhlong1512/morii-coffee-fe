import { apiGet, apiPatch, apiPost } from "@/lib/api";
import type {
  ApiCreateShippingQuoteRequest,
  ApiShipmentSummary,
  ApiShippingDistrict,
  ApiShippingProvince,
  ApiShippingQuote,
  ApiShippingWard,
} from "@/types/api";

export async function getShippingProvinces(): Promise<ApiShippingProvince[]> {
  return apiGet<ApiShippingProvince[]>("/v1/shipping/ghn/provinces");
}

export async function getShippingDistricts(
  provinceId: number
): Promise<ApiShippingDistrict[]> {
  return apiGet<ApiShippingDistrict[]>(
    `/v1/shipping/ghn/districts?provinceId=${provinceId}`
  );
}

export async function getShippingWards(
  districtId: number
): Promise<ApiShippingWard[]> {
  return apiGet<ApiShippingWard[]>(
    `/v1/shipping/ghn/wards?districtId=${districtId}`
  );
}

export async function createShippingQuote(
  payload: ApiCreateShippingQuoteRequest
): Promise<ApiShippingQuote> {
  return apiPost<ApiShippingQuote>("/v1/shipping/quotes", payload);
}

export async function getShipmentSummary(
  orderId: string
): Promise<ApiShipmentSummary | null> {
  try {
    return await apiGet<ApiShipmentSummary>(`/v1/shipping/orders/${orderId}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null;
    }
    throw error;
  }
}

export async function createShipmentForOrder(
  orderId: string
): Promise<ApiShipmentSummary> {
  return apiPost<ApiShipmentSummary>(`/v1/shipping/orders/${orderId}/create`, {});
}

export async function requoteShipmentForOrder(
  orderId: string
): Promise<ApiShipmentSummary> {
  return apiPost<ApiShipmentSummary>(`/v1/shipping/orders/${orderId}/requote`, {});
}

export async function syncShipmentForOrder(
  orderId: string
): Promise<ApiShipmentSummary> {
  return apiPost<ApiShipmentSummary>(`/v1/shipping/orders/${orderId}/sync`, {});
}

export async function cancelShipmentForOrder(
  orderId: string
): Promise<ApiShipmentSummary> {
  return apiPost<ApiShipmentSummary>(`/v1/shipping/orders/${orderId}/cancel`, {});
}

export async function updateShipmentNoteForOrder(
  orderId: string,
  note: string
): Promise<ApiShipmentSummary> {
  return apiPatch<ApiShipmentSummary>(`/v1/shipping/orders/${orderId}/note`, {
    note,
  });
}
