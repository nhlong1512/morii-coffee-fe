import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { formatProductSize } from "@/lib/utils";
import type { CartItem } from "@/types";
import type { ApiCart, ApiCartItem, ApiProductVariant } from "@/types/api";

interface CartItemMutationPayload {
  productId: string;
  variantId: string | null;
  quantity: number;
}

interface MergeCartPayload {
  items: CartItemMutationPayload[];
}

function normalizeVariantId(variantId?: string | null): string | null {
  return variantId ?? null;
}

export function mapApiCartItem(item: ApiCartItem): CartItem {
  return {
    cartItemId: item.id,
    productId: item.productId,
    variantId: item.variantId,
    name: item.productName,
    price: item.unitPrice,
    quantity: item.quantity,
    size: formatProductSize(item.variantLabel),
    image: item.imageUrl ?? "",
  };
}

export async function getCart(): Promise<CartItem[]> {
  const cart = await apiGet<ApiCart>("/v1/cart");
  return (cart?.items ?? []).map(mapApiCartItem);
}

export async function addCartItem(item: CartItem): Promise<void> {
  await apiPost<void>("/v1/cart/items", {
    productId: item.productId,
    variantId: normalizeVariantId(item.variantId),
    quantity: item.quantity,
  });
}

export async function updateCartItem(item: CartItem): Promise<void> {
  await apiPut<void>("/v1/cart/items", {
    productId: item.productId,
    variantId: normalizeVariantId(item.variantId),
    quantity: item.quantity,
  });
}

export async function removeCartItem(
  cartItemIdOrProductId: string,
  productId: string,
  variantId?: string | null
): Promise<void> {
  void cartItemIdOrProductId;

  await apiDelete("/v1/cart/items", {
    body: JSON.stringify({
      productId,
      variantId: normalizeVariantId(variantId),
    }),
    headers: { "Content-Type": "application/json" },
  });
}

export async function clearCart(): Promise<void> {
  await apiDelete("/v1/cart");
}

export async function mergeCart(items: CartItem[]): Promise<CartItem[]> {
  const payload: MergeCartPayload = {
    items: items.map((item) => ({
      productId: item.productId,
      variantId: normalizeVariantId(item.variantId),
      quantity: item.quantity,
    })),
  };

  const cart = await apiPost<ApiCart>("/v1/cart/merge", payload);
  return (cart?.items ?? []).map(mapApiCartItem);
}

export function mapProductVariantToCartItem(
  product: Pick<CartItem, "productId" | "name" | "quantity" | "image">,
  variant: ApiProductVariant
): CartItem {
  return {
    productId: product.productId,
    name: product.name,
    quantity: product.quantity,
    image: product.image,
    variantId: variant.id,
    size: formatProductSize(variant.size),
    price: variant.totalPrice,
  };
}
