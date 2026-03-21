// ---------------------------------------------------------------------------
// API response types — mirror the backend DTOs exactly.
// ---------------------------------------------------------------------------

export type ApiProductStatus = "Active" | "Inactive";
export type ApiUpdateProductStatus = "Active" | "Inactive" | "OutOfStock";
export type ApiProductSize = "Small" | "Medium" | "Large";

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
  status: ApiProductStatus;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface ApiProductVariant {
  id: string;
  productId: string;
  name: string;
  size: ApiProductSize;
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

/** Full product detail including variants, categories, and images (ProductDto). */
export interface ApiProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  categories: ApiCategory[];
  thumbnailUrl: string | null;
  status: ApiProductStatus;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string | null;
  variants: ApiProductVariant[];
  images: ApiProductImage[];
}
