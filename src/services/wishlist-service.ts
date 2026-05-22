import { apiDelete, apiGet, apiPost } from "@/lib/api";
import type { WishlistItem } from "@/stores/wishlist-store";
import type { ApiWishlist, ApiWishlistItem, ApiMergeWishlistRequest } from "@/types/api";

// ---------------------------------------------------------------------------
// Mapper
// ---------------------------------------------------------------------------

export function mapApiWishlistItem(item: ApiWishlistItem): WishlistItem {
  return {
    productId: item.productId,
    name: item.productName,
    slug: item.productSlug,
    price: item.basePrice,
    image: item.thumbnailUrl ?? "",
    inStock: item.inStock,
    addedAt: item.addedAt,
    quantitySold: item.quantitySold,
  };
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

export async function getWishlist(): Promise<WishlistItem[]> {
  const res = await apiGet<ApiWishlist>("/v1/wishlist");
  return (res?.items ?? []).map(mapApiWishlistItem);
}

export async function addItem(productId: string): Promise<void> {
  await apiPost<void>("/v1/wishlist/items", { productId });
}

export async function removeItem(productId: string): Promise<void> {
  await apiDelete(`/v1/wishlist/items/${productId}`);
}

export async function clearWishlist(): Promise<void> {
  await apiDelete("/v1/wishlist");
}

export async function mergeWishlist(
  localItems: WishlistItem[]
): Promise<WishlistItem[]> {
  const payload: ApiMergeWishlistRequest = {
    guestItems: localItems.map((i) => ({ productId: i.productId })),
  };
  const res = await apiPost<ApiWishlist | null>("/v1/wishlist/merge", payload);
  if (!res?.items) {
    return await getWishlist();
  }
  return res.items.map(mapApiWishlistItem);
}
