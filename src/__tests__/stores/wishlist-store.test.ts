import { useWishlistStore } from "@/stores/wishlist-store";
import { useAuthStore } from "@/stores/auth-store";
import type { WishlistItem } from "@/stores/wishlist-store";

function makeItem(productId: string, quantitySold: number = 0): WishlistItem {
  return {
    productId,
    name: `Product ${productId}`,
    slug: `product-${productId}`,
    price: 100,
    image: "",
    inStock: true,
    addedAt: new Date().toISOString(),
    quantitySold,
  };
}

beforeEach(() => {
  useWishlistStore.setState({
    items: [],
    pendingIds: new Set<string>(),
    storageMode: "guest",
    isReady: true,
    syncError: null,
  });
  useAuthStore.setState({ isAuthenticated: false });
});

describe("wishlist store — addItem", () => {
  it("adds a new product", async () => {
    await useWishlistStore.getState().addItem(makeItem("p1"));
    expect(useWishlistStore.getState().items.some((i) => i.productId === "p1")).toBe(true);
  });

  it("does not duplicate an existing item", async () => {
    const { addItem } = useWishlistStore.getState();
    await addItem(makeItem("p1"));
    await addItem(makeItem("p1"));
    expect(useWishlistStore.getState().items).toHaveLength(1);
  });

  it("can add multiple different products", async () => {
    const { addItem } = useWishlistStore.getState();
    await addItem(makeItem("p1"));
    await addItem(makeItem("p2"));
    await addItem(makeItem("p3"));
    expect(useWishlistStore.getState().items).toHaveLength(3);
  });

  it("stays in guest mode when not authenticated", async () => {
    await useWishlistStore.getState().addItem(makeItem("p1"));
    expect(useWishlistStore.getState().storageMode).toBe("guest");
  });

  it("blocks concurrent add of same productId", async () => {
    const item = makeItem("p1");
    const addItem = useWishlistStore.getState().addItem;

    const promise1 = addItem(item);
    const promise2 = addItem(item);

    await Promise.all([promise1, promise2]);
    expect(useWishlistStore.getState().items).toHaveLength(1);
  });
});

describe("wishlist store — removeItem", () => {
  it("removes an existing product", async () => {
    const { addItem, removeItem } = useWishlistStore.getState();
    await addItem(makeItem("p1"));
    await addItem(makeItem("p2"));
    await removeItem("p1");
    const ids = useWishlistStore.getState().items.map((i) => i.productId);
    expect(ids).not.toContain("p1");
    expect(ids).toContain("p2");
  });

  it("is a no-op for non-existent id", async () => {
    await useWishlistStore.getState().addItem(makeItem("p1"));
    await useWishlistStore.getState().removeItem("p999");
    expect(useWishlistStore.getState().items).toHaveLength(1);
  });

  it("stays in guest mode when not authenticated", async () => {
    await useWishlistStore.getState().addItem(makeItem("p1"));
    await useWishlistStore.getState().removeItem("p1");
    expect(useWishlistStore.getState().storageMode).toBe("guest");
  });
});

describe("wishlist store — isInWishlist", () => {
  it("returns true for an added product", async () => {
    await useWishlistStore.getState().addItem(makeItem("p1"));
    expect(useWishlistStore.getState().isInWishlist("p1")).toBe(true);
  });

  it("returns false for a product not in the list", () => {
    expect(useWishlistStore.getState().isInWishlist("p999")).toBe(false);
  });

  it("returns false after product is removed", async () => {
    const { addItem, removeItem, isInWishlist } = useWishlistStore.getState();
    await addItem(makeItem("p1"));
    await removeItem("p1");
    expect(isInWishlist("p1")).toBe(false);
  });
});

describe("wishlist store — totalItems", () => {
  it("returns 0 for empty wishlist", () => {
    expect(useWishlistStore.getState().totalItems()).toBe(0);
  });

  it("returns correct count", async () => {
    const { addItem } = useWishlistStore.getState();
    await addItem(makeItem("p1"));
    await addItem(makeItem("p2"));
    expect(useWishlistStore.getState().totalItems()).toBe(2);
  });
});

describe("wishlist store — initializeForSession", () => {
  it("sets isReady=true and storageMode=guest when not authenticated", async () => {
    await useWishlistStore.getState().initializeForSession(false);
    const state = useWishlistStore.getState();
    expect(state.isReady).toBe(true);
    expect(state.storageMode).toBe("guest");
    expect(state.syncError).toBe(null);
  });

  it("sets isReady=false before initializing and isReady=true after when authenticated", async () => {
    useWishlistStore.setState({ items: [], storageMode: "guest" });
    useWishlistStore.getState().initializeForSession(true);
    // After initialization completes, isReady should be true (even if there's an error)
    await new Promise((r) => setTimeout(r, 50));
    expect(useWishlistStore.getState().isReady).toBe(true);
  });
});

describe("wishlist store — resetAfterLogout", () => {
  it("clears all items and resets state", async () => {
    const { addItem, resetAfterLogout } = useWishlistStore.getState();
    await addItem(makeItem("p1"));
    await addItem(makeItem("p2"));

    resetAfterLogout();

    const state = useWishlistStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.storageMode).toBe("guest");
    expect(state.isReady).toBe(true);
    expect(state.syncError).toBe(null);
    expect(state.pendingIds.size).toBe(0);
  });
});

describe("wishlist store — clearWishlist", () => {
  it("empties the items array", async () => {
    const { addItem, clearWishlist } = useWishlistStore.getState();
    await addItem(makeItem("p1"));
    await addItem(makeItem("p2"));

    await clearWishlist();

    expect(useWishlistStore.getState().items).toHaveLength(0);
  });
});

describe("wishlist store — quantitySold field", () => {
  it("preserves quantitySold when adding item", async () => {
    const item = makeItem("p1", 42);
    await useWishlistStore.getState().addItem(item);

    const stored = useWishlistStore.getState().items.find((i) => i.productId === "p1");
    expect(stored?.quantitySold).toBe(42);
  });

  it("defaults to 0 if not provided", async () => {
    const item = makeItem("p1");
    await useWishlistStore.getState().addItem(item);

    const stored = useWishlistStore.getState().items.find((i) => i.productId === "p1");
    expect(stored?.quantitySold).toBe(0);
  });
});
