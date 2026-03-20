import { apiFetch } from "@/lib/api";
import type {
  ApiMetadata,
  ApiPagination,
  ApiCategory,
  ApiProductDetail,
  ApiProductSummary,
  ApiUpdateProductStatus,
} from "@/types/api";
import type { Product } from "@/data/products";

// ---------------------------------------------------------------------------
// Mappers — convert backend DTOs to the frontend Product interface.
// ---------------------------------------------------------------------------

function summaryToProduct(dto: ApiProductSummary): Product {
  return {
    id:            dto.id,
    name:          dto.name,
    slug:          dto.slug,
    description:   "",
    price:         dto.basePrice,
    variantPrices: {},
    categories:    dto.categoryNames.length > 0 ? dto.categoryNames : ["espresso"],
    image:         dto.thumbnailUrl ?? "",
    images:        dto.thumbnailUrl ? [dto.thumbnailUrl] : [],
    sizes:         [],
    inStock:       dto.status === "Active",
    rating:        0,
    reviewCount:   0,
    featured:      dto.isFeatured,
  };
}

// ---------------------------------------------------------------------------
// Simple in-memory cache so the full product list is only fetched once
// per page session (avoids redundant requests on the detail page).
// ---------------------------------------------------------------------------

let _cachedProducts: Product[] | null = null;
let _fetchPromise: Promise<Product[]> | null = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface GetProductsOptions {
  isFeatured?: boolean;
  page?: number;
  size?: number;
  takeAll?: boolean;
}

/** Fetches a paginated list of products from the backend. */
export async function getProducts(
  opts: GetProductsOptions = {}
): Promise<{ products: Product[]; hasNext: boolean; totalCount: number }> {
  const params = new URLSearchParams();
  if (opts.isFeatured !== undefined) {
    params.set("isFeatured", String(opts.isFeatured));
  }
  if (opts.page !== undefined) {
    params.set("page", String(opts.page));
  }
  if (opts.size !== undefined) {
    params.set("size", String(opts.size));
  }
  if (opts.takeAll) {
    params.set("takeAll", "true");
  }

  const query = params.toString();
  const url = query ? `/v1/products?${query}` : "/v1/products";
  const data = await apiFetch<ApiPagination<ApiProductSummary>>(url);

  return {
    products:   data.items.map(summaryToProduct),
    hasNext:    data.metadata.hasNext,
    totalCount: data.metadata.totalCount,
  };
}

/** Fetches all products once and caches the result in memory. */
export async function getAllProducts(): Promise<Product[]> {
  if (_cachedProducts) return _cachedProducts;
  _fetchPromise ??= getProducts({ takeAll: true }).then((r) => {
    _cachedProducts = r.products;
    return _cachedProducts;
  });
  return _fetchPromise;
}

/** Fetches the raw ApiProductDetail (including per-variant additionalPrice) by ID. */
export async function getProductDetail(id: string): Promise<ApiProductDetail> {
  return apiFetch<ApiProductDetail>(`/v1/products/${id}`);
}

/**
 * Finds a product by slug and fetches its full detail (variants + images).
 * Uses the in-memory cache to resolve slug → id, then calls the detail endpoint.
 */
export async function getProductBySlug(slug: string): Promise<ApiProductDetail | undefined> {
  const all = await getAllProducts();
  const summary = all.find((p) => p.slug === slug);
  if (!summary) return undefined;
  return getProductDetail(summary.id);
}

/** Deletes a product by ID (soft-delete). */
export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<void>(`/v1/products/${id}`, { method: "DELETE" });
  clearProductsCache();
}

/** Clears the in-memory product cache (useful for testing or after mutations). */
export function clearProductsCache(): void {
  _cachedProducts = null;
  _fetchPromise = null;
}

/** Fetches all categories from the backend. */
export async function getCategories(): Promise<ApiCategory[]> {
  const data = await apiFetch<ApiPagination<ApiCategory>>("/v1/categories?takeAll=true");
  return data.items;
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

/**
 * Updates a product via PUT /v1/products/{id} (multipart/form-data).
 * categoryIds must be an array of UUIDs. If thumbnail is omitted, the
 * existing thumbnail is preserved by the backend.
 */
export async function updateProduct(
  id: string,
  request: UpdateProductRequest
): Promise<ApiProductDetail> {
  const formData = new FormData();
  formData.append("name", request.name);
  if (request.slug !== undefined) formData.append("slug", request.slug);
  if (request.description !== undefined) formData.append("description", request.description);
  formData.append("basePrice", String(request.basePrice));
  for (const categoryId of request.categoryIds) {
    formData.append("categoryIds", categoryId);
  }
  if (request.thumbnail) formData.append("thumbnail", request.thumbnail);
  if (request.status !== undefined) formData.append("status", request.status);
  if (request.isFeatured !== undefined) formData.append("isFeatured", String(request.isFeatured));
  if (request.displayOrder !== undefined) formData.append("displayOrder", String(request.displayOrder));

  const result = await apiFetch<ApiProductDetail>(`/v1/products/${id}`, {
    method: "PUT",
    body: formData,
  });
  clearProductsCache();
  return result;
}
