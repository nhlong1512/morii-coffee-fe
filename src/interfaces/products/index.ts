import type { ApiUpdateProductStatus } from "@/types/api";

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

export interface UpdateProductRequest {
  name: string;
  slug?: string;
  description?: string;
  basePrice: number;
  categoryIds: string[];
  thumbnail?: File;
  status?: ApiUpdateProductStatus;
  isFeatured?: boolean;
  displayOrder?: number;
}
