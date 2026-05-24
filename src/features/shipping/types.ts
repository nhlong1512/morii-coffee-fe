import type {
  ApiCreateShippingQuoteRequest,
  ApiDeliveryProfile,
  ApiShipmentSummary,
  ApiShippingDistrict,
  ApiShippingProvince,
  ApiShippingQuote,
  ApiShippingWard,
} from "@/types/api";
import type {
  DeliveryInfo,
  DeliveryMethod,
  ShipmentStatus,
} from "@/types";

export type ShippingProvince = ApiShippingProvince;
export type ShippingDistrict = ApiShippingDistrict;
export type ShippingWard = ApiShippingWard;
export type ShippingQuote = ApiShippingQuote;
export type ShippingQuoteRequest = ApiCreateShippingQuoteRequest;
export type ShippingShipmentSummary = ApiShipmentSummary;

export interface ShippingAddressFormValue extends DeliveryInfo {
  provinceId: number | null;
  provinceName: string | null;
  districtId: number | null;
  districtName: string | null;
  wardCode: string | null;
  wardName: string | null;
}

export interface ShippingCheckoutState {
  deliveryMethod: DeliveryMethod;
  delivery: ShippingAddressFormValue;
}

export interface ShippingSelectorsState {
  provinces: ShippingProvince[];
  districts: ShippingDistrict[];
  wards: ShippingWard[];
  loadingProvinces: boolean;
  loadingDistricts: boolean;
  loadingWards: boolean;
  error: string | null;
}

export interface UseShippingSelectorsResult extends ShippingSelectorsState {
  refetchProvinces: () => Promise<void>;
}

export interface UseShippingQuoteResult {
  quote: ShippingQuote | null;
  loading: boolean;
  error: string | null;
  quoteInvalidated: boolean;
  requestQuote: (
    request: ShippingQuoteRequest
  ) => Promise<ShippingQuote | null>;
  setQuote: (quote: ShippingQuote | null) => void;
  invalidateQuote: () => void;
  resetQuote: () => void;
}

export interface UseShipmentSummaryResult {
  shipment: ShippingShipmentSummary | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<ShippingShipmentSummary | null>;
  setShipment: (shipment: ShippingShipmentSummary | null) => void;
}

export type ShipmentActionType =
  | "create"
  | "requote"
  | "sync"
  | "cancel"
  | "update-note";

export interface ShipmentActionResult {
  shipment: ShippingShipmentSummary | null;
  message: string | null;
}

export interface ShipmentActionState {
  isSubmitting: boolean;
  actionError: string | null;
  actionMessage: string | null;
  runAction: (
    action: ShipmentActionType,
    payload?: { note?: string }
  ) => Promise<ShipmentActionResult | null>;
}

export interface ShipmentStatusTone {
  badgeVariant: "default" | "warning" | "info" | "success" | "error";
  isPending: boolean;
  isActive: boolean;
  isClosed: boolean;
  isRecoverable: boolean;
}

export type DeliveryProfileInput = ApiDeliveryProfile;

export interface ShipmentNotePayload {
  note: string;
}

export type CancellableShipmentStatus =
  | "CREATE_PENDING"
  | "CREATED"
  | "READY_TO_PICK"
  | "PICKING"
  | "PICKED"
  | "STORING"
  | "TRANSPORTING"
  | "SORTING";

export const CANCELLABLE_SHIPMENT_STATUSES: ShipmentStatus[] = [
  "CREATE_PENDING",
  "CREATED",
  "READY_TO_PICK",
  "PICKING",
  "PICKED",
  "STORING",
  "TRANSPORTING",
  "SORTING",
];

export function createEmptyShippingAddress(): ShippingAddressFormValue {
  return {
    fullName: "",
    phoneNumber: "",
    address: "",
    provinceId: null,
    provinceName: null,
    districtId: null,
    districtName: null,
    wardCode: null,
    wardName: null,
  };
}
