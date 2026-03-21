import { ProductStatus, ProductSize } from "@/enums";

// ---------------------------------------------------------------------------
// Query options
// ---------------------------------------------------------------------------

export interface GetProductsOptions {
  isFeatured?: boolean;
  page?: number;
  size?: number;
  takeAll?: boolean;
}

// ---------------------------------------------------------------------------
// Mutation request bodies
// ---------------------------------------------------------------------------

export interface CreateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  basePrice: number;
  categoryIds: string[];
  thumbnail?: File;
  isFeatured?: boolean;
  displayOrder?: number;
}

export interface CreateVariantRequest {
  name: string;
  size: ProductSize;
  additionalPrice: number;
  sku?: string;
  stockQuantity: number;
  isDefault: boolean;
  isAvailable?: boolean;
}

export interface UpdateVariantRequest {
  name: string;
  size: ProductSize;
  additionalPrice: number;
  sku: string;
  stockQuantity: number;
  isDefault: boolean;
  isAvailable: boolean;
}

export interface UpdateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  basePrice: number;
  categoryIds: string[];
  thumbnail?: File;
  status?: ProductStatus;
  isFeatured?: boolean;
  displayOrder?: number;
}
