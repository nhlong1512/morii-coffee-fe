import { apiFetch } from "@/lib/api";
import type {
  ApiPagination,
  ApiProductDetail,
  ApiProductSummary,
  ApiProductSize,
} from "@/types/api";
import type { Product } from "@/data/products";
import type { ProductCategory, ProductSize } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Mappers — convert backend DTOs to the frontend Product interface.
// ---------------------------------------------------------------------------

const CATEGORY_MAP: Record<string, ProductCategory> = {
  Espresso:    "espresso",
  "Cold Brew": "cold-brew",
  Latte:       "latte",
  Pastry:      "pastry",
  Merchandise: "merchandise",
};

const SIZE_MAP: Record<ApiProductSize, ProductSize> = {
  Small:      "S",
  Medium:     "M",
  Large:      "L",
  ExtraLarge: "XL",
};

function mapCategory(categoryNames: string[]): ProductCategory {
  const first = categoryNames[0] ?? "";
  return CATEGORY_MAP[first] ?? "espresso";
}

function mapSizes(variants: ApiProductDetail["variants"]): ProductSize[] {
  // Filter to available variants only; exclude the synthetic "Standard" single-size variant
  // used for pastry/merchandise (all map to "S" but they don't have real size options).
  const hasSizeOptions = variants.some(
    (v) => v.size !== "Small" || variants.length > 1
  );
  if (!hasSizeOptions) return [];
  return variants
    .filter((v) => v.isAvailable)
    .map((v) => SIZE_MAP[v.size])
    .filter((s): s is ProductSize => !!s);
}

function summaryToProduct(dto: ApiProductSummary): Product {
  return {
    id:          dto.id,
    name:        dto.name,
    slug:        dto.slug,
    description: "",
    price:       dto.basePrice,
    category:    mapCategory(dto.categoryNames),
    image:       dto.thumbnailUrl ?? "",
    images:      dto.thumbnailUrl ? [dto.thumbnailUrl] : [],
    sizes:       [],
    inStock:     dto.status !== "OutOfStock",
    rating:      0,
    reviewCount: 0,
    featured:    dto.isFeatured,
  };
}

function detailToProduct(dto: ApiProductDetail): Product {
  const hasSizeOptions =
    dto.variants.length > 1 ||
    (dto.variants.length === 1 && dto.variants[0].name !== "Standard");

  return {
    id:          dto.id,
    name:        dto.name,
    slug:        dto.slug,
    description: dto.description ?? "",
    price:       dto.basePrice,
    category:    mapCategory(dto.categories.map((c) => c.name)),
    image:       dto.thumbnailUrl ?? "",
    images:      dto.thumbnailUrl ? [dto.thumbnailUrl] : [],
    sizes:       hasSizeOptions ? mapSizes(dto.variants) : [],
    inStock:     dto.status !== "OutOfStock",
    rating:      0,
    reviewCount: 0,
    featured:    dto.isFeatured,
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
  if (opts.isFeatured !== undefined)
    params.set("isFeatured", String(opts.isFeatured));
  if (opts.page !== undefined) params.set("page", String(opts.page));
  if (opts.size !== undefined) params.set("size", String(opts.size));
  if (opts.takeAll) params.set("takeAll", "true");

  const query = params.toString();
  const data = await apiFetch<ApiPagination<ApiProductSummary>>(
    `/v1/products${query ? `?${query}` : ""}`
  );

  return {
    products:   data.items.map(summaryToProduct),
    hasNext:    data.metadata.hasNext,
    totalCount: data.metadata.totalCount,
  };
}

/** Fetches all products once and caches the result in memory. */
export async function getAllProducts(): Promise<Product[]> {
  if (_cachedProducts) return _cachedProducts;
  if (!_fetchPromise) {
    _fetchPromise = getProducts({ takeAll: true }).then((r) => {
      _cachedProducts = r.products;
      return _cachedProducts;
    });
  }
  return _fetchPromise;
}

/** Fetches the full product detail (with variants) by ID. */
export async function getProductById(id: string): Promise<Product> {
  const dto = await apiFetch<ApiProductDetail>(`/v1/products/${id}`);
  return detailToProduct(dto);
}

/** Finds a product by slug — uses the in-memory cache to avoid extra requests. */
export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug);
}

/** Clears the in-memory product cache (useful for testing or after mutations). */
export function clearProductsCache(): void {
  _cachedProducts = null;
  _fetchPromise = null;
}
