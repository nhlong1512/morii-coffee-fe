import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import { ProductStatus } from "@/enums";
import type {
  ApiPagination,
  ApiProductDetail,
  ApiProductSummary,
  ApiProductVariant,
  ApiUploadedImage,
} from "@/types/api";
import type { Product } from "@/data/products";
import type {
  GetProductsOptions,
  CreateProductRequest,
  UpdateProductRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
} from "@/interfaces/products";
import { buildProductFormData } from "@/helpers/products";

export type {
  GetProductsOptions,
  CreateProductRequest,
  UpdateProductRequest,
  CreateVariantRequest,
  UpdateVariantRequest,
} from "@/interfaces/products";

// ---------------------------------------------------------------------------
// Mapper — ApiProductSummary → frontend Product
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
    inStock:       dto.status === ProductStatus.Active,
    rating:        0,
    reviewCount:   0,
    featured:      dto.isFeatured,
  };
}

// ---------------------------------------------------------------------------
// In-memory cache — avoids redundant list fetches within a page session
// ---------------------------------------------------------------------------

let _cachedProducts: Product[] | null = null;
let _fetchPromise: Promise<Product[]> | null = null;

export function clearProductsCache(): void {
  _cachedProducts = null;
  _fetchPromise = null;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export async function getProducts(
  opts: GetProductsOptions = {}
): Promise<{ products: Product[]; hasNext: boolean; totalCount: number }> {
  const params = new URLSearchParams();
  if (opts.isFeatured !== undefined) params.set("isFeatured", String(opts.isFeatured));
  if (opts.page !== undefined) params.set("page", String(opts.page));
  if (opts.size !== undefined) params.set("size", String(opts.size));
  if (opts.takeAll) params.set("takeAll", "true");

  const query = params.toString();
  const url = query ? `/v1/products?${query}` : "/v1/products";
  const data = await apiGet<ApiPagination<ApiProductSummary>>(url);

  return {
    products:   data.items.map(summaryToProduct),
    hasNext:    data.metadata.hasNext,
    totalCount: data.metadata.totalCount,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  if (_cachedProducts) return _cachedProducts;
  _fetchPromise ??= getProducts({ takeAll: true }).then((r) => {
    _cachedProducts = r.products;
    return _cachedProducts;
  });
  return _fetchPromise;
}

export async function getProductDetail(id: string): Promise<ApiProductDetail> {
  return apiGet<ApiProductDetail>(`/v1/products/${id}`);
}

export async function getProductBySlug(slug: string): Promise<ApiProductDetail | undefined> {
  const all = await getAllProducts();
  const summary = all.find((p) => p.slug === slug);
  if (!summary) return undefined;
  return getProductDetail(summary.id);
}

export async function createProduct(
  request: CreateProductRequest
): Promise<ApiProductDetail> {
  const result = await apiPost<ApiProductDetail>("/v1/products", buildProductFormData(request));
  clearProductsCache();
  return result;
}

export async function updateProduct(
  id: string,
  request: UpdateProductRequest
): Promise<ApiProductDetail> {
  const result = await apiPut<ApiProductDetail>(`/v1/products/${id}`, buildProductFormData(request));
  clearProductsCache();
  return result;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiDelete(`/v1/products/${id}`);
  clearProductsCache();
}

export async function uploadProductImages(
  productId: string,
  files: File[]
): Promise<ApiUploadedImage[]> {
  const fd = new FormData();
  for (const file of files) fd.append("Files", file);
  return apiPost<ApiUploadedImage[]>(`/v1/products/${productId}/images`, fd);
}

export async function deleteProductImage(
  productId: string,
  imageId: string
): Promise<void> {
  await apiDelete(`/v1/products/${productId}/images/${imageId}`);
}

// ---------------------------------------------------------------------------
// Variants
// ---------------------------------------------------------------------------

export async function createProductVariants(
  productId: string,
  variants: CreateVariantRequest[]
): Promise<ApiProductVariant[]> {
  return apiPost<ApiProductVariant[]>(`/v1/products/${productId}/variants`, variants);
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  request: UpdateVariantRequest
): Promise<ApiProductVariant> {
  return apiPut<ApiProductVariant>(`/v1/products/${productId}/variants/${variantId}`, request);
}

export async function deleteProductVariant(
  productId: string,
  variantId: string
): Promise<void> {
  await apiDelete(`/v1/products/${productId}/variants/${variantId}`);
}

