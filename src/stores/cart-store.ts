import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/stores/auth-store";
import * as cartService from "@/services/cart-service";

export interface CartItem {
  cartItemId?: string | null;
  productId: string;
  variantId?: string | null;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

interface CartState {
  items: CartItem[];
  storageMode: "guest" | "authenticated";
  isReady: boolean;
  syncError: string | null;
  hasAttemptedMerge: boolean;
  addItem: (item: Omit<CartItem, "quantity" | "size"> & { quantity?: number; size?: string }) => Promise<void>;
  removeItem: (
    productId: string,
    size?: string,
    variantId?: string | null,
    cartItemId?: string | null
  ) => Promise<void>;
  updateQuantity: (
    productId: string,
    quantity: number,
    size?: string,
    variantId?: string | null,
    cartItemId?: string | null
  ) => Promise<void>;
  changeVariant: (
    currentItem: CartItem,
    nextItem: Omit<CartItem, "cartItemId">
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
  initializeForSession: (isAuthenticated: boolean) => Promise<void>;
  resetAfterLogout: () => void;
}

function isAuthenticated(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

function cartKey(
  item: Pick<CartItem, "cartItemId" | "productId" | "size" | "variantId">
): string {
  if (item.cartItemId) {
    return `cart-item::${item.cartItemId}`;
  }

  return `${item.productId}::${item.variantId ?? ""}::${item.size ?? ""}`;
}

function replaceItem(
  items: CartItem[],
  nextItem: CartItem
): CartItem[] {
  return items.map((item) =>
    cartKey(item) === cartKey(nextItem) ? nextItem : item
  );
}

function removeMatchingItem(
  items: CartItem[],
  target: Pick<CartItem, "cartItemId" | "productId" | "size" | "variantId">
): CartItem[] {
  return items.filter((item) => cartKey(item) !== cartKey(target));
}

let sessionInitPromise: Promise<void> | null = null;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      storageMode: "guest",
      isReady: true,
      syncError: null,
      hasAttemptedMerge: false,

      addItem: async (item) => {
        const previousItems = get().items;
        const quantityToAdd = item.quantity ?? 1;
        const nextCartItem: CartItem = {
          ...item,
          quantity: quantityToAdd,
          size: item.size ?? "",
        };

        const existing = get().items.find(
          (i) => cartKey(i) === cartKey(nextCartItem)
        );

        if (existing) {
          const updatedItem = {
            ...existing,
            quantity: existing.quantity + quantityToAdd,
          };

          set((state) => ({
            items: replaceItem(state.items, updatedItem),
            storageMode: isAuthenticated() ? "authenticated" : "guest",
          }));

          if (!isAuthenticated()) {
            return;
          }

          try {
            await cartService.updateCartItem(updatedItem);
            const syncedItems = await cartService.getCart();
            set({
              items: syncedItems,
              storageMode: "authenticated",
              syncError: null,
            });
          } catch (error) {
            set({
              items: previousItems,
              syncError: error instanceof Error ? error.message : "Failed to sync cart",
            });
          }
          return;
        }

        set((state) => ({
          items: [...state.items, nextCartItem],
          storageMode: isAuthenticated() ? "authenticated" : "guest",
        }));

        if (!isAuthenticated()) {
          return;
        }

        try {
          await cartService.addCartItem(nextCartItem);
          const syncedItems = await cartService.getCart();
          set({
            items: syncedItems,
            storageMode: "authenticated",
            syncError: null,
          });
        } catch (error) {
          set({
            items: previousItems,
            syncError: error instanceof Error ? error.message : "Failed to sync cart",
          });
        }
      },

      removeItem: async (productId, size, variantId, cartItemId) => {
        const previousItems = get().items;
        const normalizedSize = size ?? "";
        const nextItems = previousItems.filter(
          (i) => !(
            (cartItemId
              ? i.cartItemId === cartItemId
              : i.productId === productId &&
                i.size === normalizedSize &&
                (i.variantId ?? null) === (variantId ?? null))
          )
        );

        set({
          items: nextItems,
          storageMode: isAuthenticated() ? "authenticated" : "guest",
        });

        if (!isAuthenticated()) {
          return;
        }

        try {
          await cartService.removeCartItem(
            cartItemId ?? productId,
            productId,
            variantId
          );
          const syncedItems = await cartService.getCart();
          set({
            items: syncedItems,
            storageMode: "authenticated",
            syncError: null,
          });
        } catch (error) {
          set({
            items: previousItems,
            syncError: error instanceof Error ? error.message : "Failed to sync cart",
          });
        }
      },

      updateQuantity: async (productId, quantity, size, variantId, cartItemId) => {
        const normalizedSize = size ?? "";

        if (quantity <= 0) {
          await get().removeItem(productId, normalizedSize, variantId, cartItemId);
          return;
        }

        const previousItems = get().items;
        const targetItem = previousItems.find(
          (item) =>
            (cartItemId
              ? item.cartItemId === cartItemId
              : item.productId === productId &&
                item.size === normalizedSize &&
                (item.variantId ?? null) === (variantId ?? null))
        );

        if (!targetItem) {
          return;
        }

        const updatedItem = { ...targetItem, quantity };

        set((state) => ({
          items: replaceItem(state.items, updatedItem),
          storageMode: isAuthenticated() ? "authenticated" : "guest",
        }));

        if (!isAuthenticated()) {
          return;
        }

        try {
          await cartService.updateCartItem(updatedItem);
          const syncedItems = await cartService.getCart();
          set({
            items: syncedItems,
            storageMode: "authenticated",
            syncError: null,
          });
        } catch (error) {
          set({
            items: previousItems,
            syncError: error instanceof Error ? error.message : "Failed to sync cart",
          });
        }
      },

      changeVariant: async (currentItem, nextItem) => {
        const previousItems = get().items;
        const normalizedNextItem: CartItem = {
          ...nextItem,
          cartItemId: null,
          size: nextItem.size ?? "",
        };

        const withoutCurrent = removeMatchingItem(previousItems, currentItem);
        const existingReplacement = withoutCurrent.find(
          (item) => cartKey(item) === cartKey(normalizedNextItem)
        );

        const nextItems = existingReplacement
          ? replaceItem(withoutCurrent, {
              ...existingReplacement,
              quantity: existingReplacement.quantity + currentItem.quantity,
            })
          : [...withoutCurrent, normalizedNextItem];

        set({
          items: nextItems,
          storageMode: isAuthenticated() ? "authenticated" : "guest",
        });

        if (!isAuthenticated()) {
          return;
        }

        try {
          await cartService.addCartItem(normalizedNextItem);
          await cartService.removeCartItem(
            currentItem.cartItemId ?? currentItem.productId,
            currentItem.productId,
            currentItem.variantId
          );
          const syncedItems = await cartService.getCart();
          set({
            items: syncedItems,
            storageMode: "authenticated",
            syncError: null,
          });
        } catch (error) {
          let fallbackItems = previousItems;

          try {
            fallbackItems = await cartService.getCart();
          } catch {
            fallbackItems = previousItems;
          }

          set({
            items: fallbackItems,
            syncError: error instanceof Error ? error.message : "Failed to sync cart",
          });

          throw error;
        }
      },

      clearCart: async () => {
        const previousItems = get().items;

        set({
          items: [],
          storageMode: isAuthenticated() ? "authenticated" : "guest",
        });

        if (!isAuthenticated()) {
          return;
        }

        try {
          await cartService.clearCart();
          set({ syncError: null });
        } catch (error) {
          set({
            items: previousItems,
            syncError: error instanceof Error ? error.message : "Failed to sync cart",
          });
        }
      },

      totalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      initializeForSession: async (authenticated) => {
        if (!authenticated) {
          sessionInitPromise = null;
          const currentStorageMode = get().storageMode;

          if (currentStorageMode === "authenticated") {
            set({
              isReady: true,
              syncError: null,
            });
            return;
          }

          set({
            isReady: true,
            storageMode: "guest",
            syncError: null,
            hasAttemptedMerge: false,
          });
          return;
        }

        if (sessionInitPromise) {
          return sessionInitPromise;
        }

        sessionInitPromise = (async () => {
          set({ isReady: false });

          try {
            const currentStorageMode = get().storageMode;
            const hasAttemptedMerge = get().hasAttemptedMerge;
            const localItems = get().items;
            const shouldMergeGuestCart = !hasAttemptedMerge && currentStorageMode === "guest" && localItems.length > 0;

            if (shouldMergeGuestCart) {
              const syncedItems = await cartService.mergeCart(localItems);
              set({
                items: syncedItems,
                storageMode: "authenticated",
                hasAttemptedMerge: true,
                isReady: true,
                syncError: null,
              });
            } else {
              const syncedItems = await cartService.getCart();
              set({
                items: syncedItems,
                storageMode: "authenticated",
                hasAttemptedMerge: true,
                isReady: true,
                syncError: null,
              });
            }
          } catch (error) {
            set({
              isReady: true,
              hasAttemptedMerge: true,
              syncError: error instanceof Error ? error.message : "Failed to load cart",
            });
          } finally {
            sessionInitPromise = null;
          }
        })();

        return sessionInitPromise;
      },

      resetAfterLogout: () =>
        set({
          items: [],
          storageMode: "guest",
          isReady: true,
          syncError: null,
          hasAttemptedMerge: false,
        }),
    }),
    {
      name: "morii-cart",
      partialize: (state) => ({
        items: state.items,
        storageMode: state.storageMode,
      }),
    }
  )
);
