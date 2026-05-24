import type { OrderStatus } from "@/lib/constants";

export type { Product } from "@/data/products";
export type { ProductCategory, OrderStatus } from "@/lib/constants";
export { ProductSize } from "@/enums";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
  image: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  category: string;
}

export interface DeliveryInfo {
  fullName: string;
  phoneNumber: string;
  address: string;
  provinceId?: number | null;
  provinceName?: string | null;
  districtId?: number | null;
  districtName?: string | null;
  wardCode?: string | null;
  wardName?: string | null;
}

export type PaymentMethod = "COD" | "MOMO" | "PAYPAL" | "STRIPE";
export type DeliveryMethod = "PICKUP" | "GHN_DELIVERY";
export type ShippingProvider = "GHN";
export type PaymentStatus =
  | "NotRequired"
  | "Pending"
  | "Paid"
  | "Failed"
  | "Refunded"
  | "PartiallyRefunded";
export type PaymentAttemptStatus =
  | "Created"
  | "Succeeded"
  | "Failed"
  | "Expired";

export interface OrderPaymentInfo {
  paymentStatus: PaymentStatus;
  attemptCount: number;
  latestPaymentId: string | null;
  latestAttemptStatus: PaymentAttemptStatus | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  failureReason: string | null;
  latestAttemptCreatedAt: string | null;
}

export type ShipmentStatus =
  | "NOT_REQUIRED"
  | "QUOTE_PENDING"
  | "QUOTED"
  | "CREATE_PENDING"
  | "CREATED"
  | "READY_TO_PICK"
  | "PICKING"
  | "PICKED"
  | "STORING"
  | "TRANSPORTING"
  | "SORTING"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED"
  | "DELIVERY_FAILED"
  | "RETURNING"
  | "RETURNED"
  | "FAILED_TO_CREATE"
  | "SYNC_ERROR";

export interface ShippingQuoteSnapshot {
  shippingQuoteFingerprint: string;
  shippingServiceId: number;
  shippingServiceTypeId: number | null;
  shippingServiceLabel: string;
  shippingFee: number;
  shippingQuoteExpiresAt: string;
  shippingProviderEnvironment: string;
}

export interface ShipmentSummary {
  id: string;
  provider: ShippingProvider;
  providerEnvironment: string;
  status: ShipmentStatus;
  statusLabel: string;
  clientOrderCode: string | null;
  providerOrderCode: string | null;
  shopId: number | null;
  serviceId: number | null;
  serviceTypeId: number | null;
  feeTotal: number | null;
  expectedDeliveryAt: string | null;
  trackingUrl: string | null;
  failureReasonCode: string | null;
  failureReason: string | null;
  note: string | null;
  lastSyncedAt: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  delivery: DeliveryInfo;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  trackingNumber: string | null;
  paymentInfo: OrderPaymentInfo | null;
  deliveryMethod: DeliveryMethod;
  shippingProvider: ShippingProvider | null;
  shippingQuoteSnapshot: ShippingQuoteSnapshot | null;
  shipmentStatus: ShipmentStatus | null;
  shipmentStatusLabel: string | null;
  shipment: ShipmentSummary | null;
}

export interface CreateOrderRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  paymentMethod: PaymentMethod;
  notes: string | null;
  saveDeliveryProfile: boolean;
  provinceId?: number | null;
  provinceName?: string | null;
  districtId?: number | null;
  districtName?: string | null;
  wardCode?: string | null;
  wardName?: string | null;
  deliveryMethod: DeliveryMethod;
  shippingQuoteFingerprint?: string | null;
  shippingServiceId?: number | null;
  shippingServiceTypeId?: number | null;
  shippingServiceLabel?: string | null;
  shippingFee?: number | null;
  shippingQuoteExpiresAt?: string | null;
  shippingProviderEnvironment?: string | null;
}

export interface OrderItem {
  productId: string;
  variantId?: string | null;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "promotion" | "system";
  isRead: boolean;
  createdAt: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
}

export interface CartItem {
  cartItemId?: string | null;
  productId: string;
  variantId?: string | null;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}
