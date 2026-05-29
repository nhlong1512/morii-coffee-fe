import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "@/stores/auth-store";
import * as wishlistService from "@/services/wishlist-service";

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  inStock: boolean;
  addedAt: string;
  quantitySold: number;
}

interface WishlistState {
  items: WishlistItem[];
  pendingIds: Set<string>;
  storageMode: "guest" | "authenticated";
  isReady: boolean;
  syncError: string | null;

  addItem: (item: WishlistItem) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => Promise<void>;
  totalItems: () => number;
  initializeForSession: (isAuthenticated: boolean) => Promise<void>;
  resetAfterLogout: () => void;
}

function isAuth(): boolean {
  return useAuthStore.getState().isAuthenticated;
}

let sessionInitPromise: Promise<void> | null = null;

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      pendingIds: new Set<string>(),
      storageMode: "guest",
      isReady: true,
      syncError: null,

      addItem: async (item) => {
        const { productId } = item;
        if (get().pendingIds.has(productId)) return;

        const snapshot = get().items;

        set((state) => ({
          items: state.items.some((i) => i.productId === productId)
            ? state.items
            : [...state.items, item],
          pendingIds: new Set([...state.pendingIds, productId]),
          storageMode: isAuth() ? "authenticated" : "guest",
        }));

        if (!isAuth()) {
          set((state) => ({
            pendingIds: new Set([...state.pendingIds].filter((id) => id !== productId)),
          }));
          return;
        }

        try {
          await wishlistService.addItem(productId);
          const synced = await wishlistService.getWishlist();
          set({ items: synced, syncError: null });
        } catch (error) {
          set({
            items: snapshot,
            syncError: error instanceof Error ? error.message : "Failed to sync wishlist",
          });
        } finally {
          set((state) => ({
            pendingIds: new Set([...state.pendingIds].filter((id) => id !== productId)),
          }));
        }
      },

      removeItem: async (productId) => {
        if (get().pendingIds.has(productId)) return;

        const snapshot = get().items;

        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
          pendingIds: new Set([...state.pendingIds, productId]),
          storageMode: isAuth() ? "authenticated" : "guest",
        }));

        if (!isAuth()) {
          set((state) => ({
            pendingIds: new Set([...state.pendingIds].filter((id) => id !== productId)),
          }));
          return;
        }

        try {
          await wishlistService.removeItem(productId);
          const synced = await wishlistService.getWishlist();
          set({ items: synced, syncError: null });
        } catch (error) {
          set({
            items: snapshot,
            syncError: error instanceof Error ? error.message : "Failed to sync wishlist",
          });
        } finally {
          set((state) => ({
            pendingIds: new Set([...state.pendingIds].filter((id) => id !== productId)),
          }));
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      clearWishlist: async () => {
        const snapshot = get().items;

        set({
          items: [],
          storageMode: isAuth() ? "authenticated" : "guest",
        });

        if (!isAuth()) return;

        try {
          await wishlistService.clearWishlist();
          set({ syncError: null });
        } catch (error) {
          set({
            items: snapshot,
            syncError: error instanceof Error ? error.message : "Failed to sync wishlist",
          });
        }
      },

      totalItems: () => get().items.length,

      initializeForSession: async (authenticated) => {
        if (!authenticated) {
          sessionInitPromise = null;
          set({ isReady: true, storageMode: "guest", syncError: null });
          return;
        }

        if (sessionInitPromise) {
          return sessionInitPromise;
        }

        sessionInitPromise = (async () => {
          set({ isReady: false });

          try {
            const localItems = get().items;
            const shouldMerge = get().storageMode === "guest";

            const synced = shouldMerge
              ? await wishlistService.mergeWishlist(localItems)
              : await wishlistService.getWishlist();

            set({
              items: synced,
              storageMode: "authenticated",
              isReady: true,
              syncError: null,
            });
          } catch (error) {
            set({
              isReady: true,
              syncError:
                error instanceof Error ? error.message : "Failed to load wishlist",
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
          pendingIds: new Set<string>(),
        }),
    }),
    {
      name: "morii-wishlist",
      partialize: (state) => ({
        items: state.items,
        storageMode: state.storageMode,
      }),
    }
  )
);
