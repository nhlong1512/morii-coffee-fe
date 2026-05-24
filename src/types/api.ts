// ---------------------------------------------------------------------------
// API response types — mirror the backend DTOs exactly.
// ---------------------------------------------------------------------------

import { ProductStatus, ProductSize, UserRole, EUserStatus, EGender } from "@/enums";
import type {
  DeliveryMethod,
  PaymentMethod,
  PaymentStatus,
  ShipmentStatus,
  ShippingProvider,
} from "@/types";

export interface ApiMetadata {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  payloadSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
  takeAll: boolean;
}

export interface ApiPagination<T> {
  items: T[];
  metadata: ApiMetadata;
}

/** Lightweight product used in list/paginated responses (ProductSummaryDto). */
export interface ApiProductSummary {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  categoryNames: string[];
  thumbnailUrl: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  quantitySold: number;
}

export interface ApiProductVariant {
  id: string;
  productId: string;
  name: string;
  size: ProductSize;
  additionalPrice: number;
  totalPrice: number;
  sku: string | null;
  stockQuantity: number;
  isDefault: boolean;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProductImage {
  id: string;
  url: string;
  displayOrder: number;
  isThumbnail: boolean;
}

/** Response item from POST /api/v1/products/{productId}/images */
export interface ApiUploadedImage {
  id: string;
  url: string;
  displayOrder: number;
}

export interface ApiCategory {
  id: string;
  name: string;
  description: string;
  iconUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBanner {
  id: string;
  title: string;
  subtitle: string | null;
  cta: string | null;
  ctaLink: string | null;
  imageUrl: string | null;
  displayOrder: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Blog types
// ---------------------------------------------------------------------------

export type BlogPostStatus = "Draft" | "Published" | "Archived";

export interface ApiBlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ApiBlogPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  status: BlogPostStatus;
  isFeatured: boolean;
  displayOrder: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
  categories: ApiBlogCategory[];
}

export interface ApiBlogPostDetail extends ApiBlogPostSummary {
  contentHtml: string;
  contentJson: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  coverImageFileName: string | null;
}

// ---------------------------------------------------------------------------
// Auth & User types
// ---------------------------------------------------------------------------

/** Full user profile — returned by auth endpoints and GET /api/v1/users/me */
export interface ApiUserProfile {
  id: string;
  email: string;
  phoneNumber: string | null;
  userName: string;
  fullName: string | null;
  dob: string | null;
  gender: EGender | null;
  bio: string | null;
  avatarUrl: string | null;
  status: EUserStatus;
  createdAt: string;
  updatedAt: string;
  roles: UserRole[];
}

/** Auth response — returned by sign-in, sign-up, refresh-token */
export interface ApiAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ApiUserProfile;
}

/** Lightweight user item in admin paginated list */
export interface ApiUserListItem {
  id: string;
  email: string;
  userName: string;
  fullName: string | null;
  avatarUrl: string | null;
  status: EUserStatus;
}

// ---------------------------------------------------------------------------
// Product types
// ---------------------------------------------------------------------------

/** Full product detail including variants, categories, and images (ProductDto). */
export interface ApiProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  categories: ApiCategory[];
  thumbnailUrl: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
  variants: ApiProductVariant[];
  images: ApiProductImage[];
  quantitySold: number;
}

// ---------------------------------------------------------------------------
// Cart / Orders
// ---------------------------------------------------------------------------

export interface ApiCartItem {
  id: string;
  productId: string;
  variantId: string | null;
  variantLabel: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
  addedAt: string | null;
}

export interface ApiCart {
  items: ApiCartItem[];
  updatedAt: string | null;
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export interface ApiWishlistItem {
  productId: string;
  productName: string;
  productSlug: string;
  basePrice: number;
  thumbnailUrl: string | null;
  inStock: boolean;
  addedAt: string;
  quantitySold: number;
}

export interface ApiWishlist {
  items: ApiWishlistItem[];
  updatedAt: string | null;
}

export interface ApiMergeWishlistRequest {
  guestItems: Array<{ productId: string }>;
}

export interface ApiDeliveryProfile {
  fullName: string;
  phoneNumber: string;
  address: string;
  provinceId: number | null;
  provinceName: string | null;
  districtId: number | null;
  districtName: string | null;
  wardCode: string | null;
  wardName: string | null;
}

export interface ApiShippingProvince {
  provinceId: number;
  provinceName: string;
  code: string | null;
  isActive: boolean;
}

export interface ApiShippingDistrict {
  districtId: number;
  provinceId: number;
  districtName: string;
  supportType: number | null;
  isActive: boolean;
}

export interface ApiShippingWard {
  wardCode: string;
  districtId: number;
  wardName: string;
  isActive: boolean;
}

export interface ApiShippingAddressInput {
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  provinceId: number;
  provinceName: string;
  districtId: number;
  districtName: string;
  wardCode: string;
  wardName: string;
}

export interface ApiShippingQuoteService {
  serviceId: number;
  serviceTypeId: number | null;
  shortName: string;
  displayName: string;
  estimatedLeadTime: string | null;
  fee: number;
  isRecommended: boolean;
}

export interface ApiShippingFeeBreakdown {
  totalFee: number;
  serviceFee: number;
  insuranceFee: number;
  stationFee: number;
  pickStationFee: number;
  couponValue: number;
  r2SFee: number;
  returnAgainFee: number;
  documentReturnFee: number;
  doubleCheckFee: number;
  codFee: number;
  rawPayload: string | null;
}

export interface ApiShippingPackageMetrics {
  totalWeightGrams: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  insuranceValue: number;
  itemCount: number;
}

export interface ApiCreateShippingQuoteRequest {
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  address: ApiShippingAddressInput;
  selectedServiceId?: number | null;
}

export interface ApiShippingQuote {
  provider: ShippingProvider;
  environment: string;
  address: ApiShippingAddressInput;
  packageMetrics: ApiShippingPackageMetrics;
  service: ApiShippingQuoteService;
  availableServices: ApiShippingQuoteService[];
  feeBreakdown: ApiShippingFeeBreakdown;
  estimatedDeliveryAt: string | null;
  quoteExpiresAt: string;
  quoteFingerprint: string;
}

export interface ApiShipmentSummary {
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

export interface ApiCreateOrderRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  notes: string | null;
  paymentMethod: PaymentMethod;
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

export interface ApiCreateOrderResponse {
  id: string;
  orderId?: string | null;
  orderNumber?: string | null;
  userId?: string;
  deliveryFullName?: string | null;
  deliveryPhoneNumber?: string | null;
  deliveryAddress?: string | null;
  notes?: string | null;
  paymentMethod?: PaymentMethod;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total?: number;
  orderStatus?: string;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface ApiCreateCheckoutSessionRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
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

export interface ApiCheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  expiresAtUtc: string;
  checkoutDraftId: string;
  amount: number;
  currency: string | null;
  publishableKey: string | null;
}

export interface ApiStripeReconcileRequest {
  sessionId: string;
  checkoutDraftId: string;
}

export interface ApiStripeReconcileResponse {
  checkoutDraftId: string | null;
  sessionId: string | null;
  orderId: string | null;
  orderNumber: string | null;
  paymentStatus: PaymentStatus;
  failureReason: string | null;
  expiresAtUtc: string | null;
}

export interface ApiOrderSummary {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  orderStatus: string;
  total: number;
  paymentMethod?: PaymentMethod | null;
  deliveryMethod?: DeliveryMethod | null;
  shippingProvider?: ShippingProvider | null;
  shipmentStatus?: ShipmentStatus | null;
  shipmentStatusLabel?: string | null;
  itemCount?: number | null;
  totalItems?: number | null;
  firstProductName?: string | null;
  items?: Array<{
    quantity?: number | null;
    productName?: string | null;
    name?: string | null;
  }> | null;
}

/** Admin order list item — returned by GET /api/v1/orders (admin). */
export interface ApiAdminOrderSummary {
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string | null;
}

export interface ApiOrderItemSnapshot {
  id: string;
  productId: string;
  productName: string;
  variantId: string | null;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl: string | null;
}

/** Order detail — returned by GET /api/v1/orders/{id}. */
export interface ApiOrderDetail {
  id: string;
  orderNumber: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  orderStatus: string;
  items: ApiOrderItemSnapshot[];
  deliveryFullName: string;
  deliveryPhoneNumber: string;
  deliveryAddress: string;
  provinceId?: number | null;
  provinceName?: string | null;
  districtId?: number | null;
  districtName?: string | null;
  wardCode?: string | null;
  wardName?: string | null;
  notes: string | null;
  paymentMethod: PaymentMethod;
  deliveryMethod?: DeliveryMethod | null;
  shippingProvider?: ShippingProvider | null;
  shippingQuoteFingerprint?: string | null;
  shippingServiceId?: number | null;
  shippingServiceTypeId?: number | null;
  shippingServiceLabel?: string | null;
  shippingQuoteExpiresAt?: string | null;
  shippingProviderEnvironment?: string | null;
  shipmentStatus?: ShipmentStatus | null;
  shipmentStatusLabel?: string | null;
  shipment?: ApiShipmentSummary | null;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  trackingNumber: string | null;
  paymentInfo: ApiOrderPaymentInfo | null;
}

export interface ApiOrderPaymentInfo {
  paymentStatus: PaymentStatus;
  attemptCount: number;
  latestPaymentId: string | null;
  latestAttemptStatus: "Created" | "Succeeded" | "Failed" | "Expired" | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  stripeChargeId: string | null;
  failureReason: string | null;
  latestAttemptCreatedAt: string | null;
}

export interface ApiPaymentSummary {
  id: string;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  amount: number;
  currency: string | null;
  status: "Created" | "Succeeded" | "Failed" | "Expired";
  failureReason: string | null;
  createdAt: string;
  refunds: ApiRefundSummary[] | null;
}

export interface ApiRefundSummary {
  id: string;
  stripeRefundId: string | null;
  amount: number;
  reason: string | null;
  status: "Pending" | "Succeeded" | "Failed";
  createdAt: string;
}

export interface ApiOrderPaymentSummary {
  orderId: string;
  paymentStatus: PaymentStatus;
  payments: ApiPaymentSummary[] | null;
}

export interface ApiCreateRefundRequest {
  amount?: number;
  reason?: string;
}

export interface ApiRefundResponse {
  refundId: string;
  stripeRefundId: string | null;
  amount: number;
  status: "Pending" | "Succeeded" | "Failed";
  paymentStatus: PaymentStatus;
}

export interface ApiRefundReconcileResponse {
  orderId: string;
  paymentStatus: PaymentStatus;
  latestRefundStatus: "Pending" | "Succeeded" | "Failed" | null;
  reconciled: boolean;
  reconciledRefundCount: number;
}

// ---------------------------------------------------------------------------
// Admin Reports
// ---------------------------------------------------------------------------

export type ApiReportPreset = "7D" | "30D" | "90D" | "1Y" | "CUSTOM";
export type ApiReportGranularity = "day" | "week" | "month";
export type ApiReportChangeDirection = "up" | "down" | "flat" | "up_from_zero";

export interface ApiAdminReportsQuery {
  preset?: ApiReportPreset;
  from?: string;
  to?: string;
  granularity?: ApiReportGranularity;
  timezone?: string;
}

export interface ApiAdminReportsRange {
  from: string;
  to: string;
  preset: ApiReportPreset | null;
  granularity: ApiReportGranularity;
  timezone: string;
  comparisonFrom: string;
  comparisonTo: string;
}

export interface ApiAdminReportMetricCard {
  value: number;
  previousValue: number | null;
  changePercent: number | null;
  changeDirection: ApiReportChangeDirection | null;
  comparisonSupported: boolean;
}

export interface ApiAdminRevenuePoint {
  bucketStart: string;
  bucketEnd: string;
  label: string;
  grossRevenue: number;
  refundAmount: number;
  netRevenue: number;
  paidOrders: number;
}

export interface ApiAdminRevenueSeries {
  summary: {
    grossRevenue: number;
    refundAmount: number;
    netRevenue: number;
    paidOrders: number;
    averageOrderValue: number;
    currency: "VND";
  };
  points: ApiAdminRevenuePoint[];
}

export interface ApiAdminOrderStatusItem {
  status: string;
  count: number;
  percentage: number;
}

export interface ApiAdminOrdersByStatus {
  totalOrders: number;
  items: ApiAdminOrderStatusItem[];
}

export interface ApiAdminTopProduct {
  productId: string;
  productName: string;
  thumbnailUrl: string | null;
  unitsSold: number;
  orderCount: number;
  grossRevenue: number;
}

export interface ApiAdminTopProducts {
  items: ApiAdminTopProduct[];
}

export interface ApiAdminNewUserPoint {
  bucketStart: string;
  bucketEnd: string;
  label: string;
  users: number;
}

export interface ApiAdminNewUsersSeries {
  totalNewUsers: number;
  points: ApiAdminNewUserPoint[];
}

export interface ApiAdminReportsDashboard {
  range: ApiAdminReportsRange;
  cards: {
    totalRevenue: ApiAdminReportMetricCard;
    totalOrders: ApiAdminReportMetricCard;
    newUsers: ApiAdminReportMetricCard;
    activeProducts: ApiAdminReportMetricCard;
  };
  revenueSeries: ApiAdminRevenueSeries;
  ordersByStatus: ApiAdminOrdersByStatus;
  topProducts: ApiAdminTopProducts;
  newUsersSeries: ApiAdminNewUsersSeries;
}
