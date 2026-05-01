// ---------------------------------------------------------------------------
// API response types — mirror the backend DTOs exactly.
// ---------------------------------------------------------------------------

import { ProductStatus, ProductSize, UserRole, EUserStatus, EGender } from "@/enums";

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

export interface ApiDeliveryProfile {
  fullName: string;
  phoneNumber: string;
  address: string;
}

export interface ApiCreateOrderRequest {
  fullName: string;
  phoneNumber: string;
  address: string;
  notes: string | null;
  paymentMethod: "COD" | "MOMO" | "PAYPAL";
  saveDeliveryProfile: boolean;
}

export interface ApiCreateOrderResponse {
  orderId: string;
}

export interface ApiOrderSummary {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  orderStatus: string;
  total: number;
  itemCount?: number | null;
  totalItems?: number | null;
  firstProductName?: string | null;
  items?: Array<{
    quantity?: number | null;
    productName?: string | null;
    name?: string | null;
  }> | null;
}

export interface ApiOrderItemSnapshot {
  productId: string;
  productName: string;
  variantId: string | null;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  imageUrl?: string | null;
}

export interface ApiOrderDetail {
  id: string;
  orderNumber?: string | null;
  createdAt: string;
  orderStatus: string;
  items: ApiOrderItemSnapshot[];
  deliveryInfo?: ApiDeliveryProfile | null;
  fullName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  notes: string | null;
  paymentMethod: "COD" | "MOMO" | "PAYPAL";
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  trackingNumber: string | null;
}
