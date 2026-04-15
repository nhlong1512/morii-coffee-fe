import { useWishlistStore } from "@/stores/wishlist-store";

beforeEach(() => {
  useWishlistStore.setState({ items: [] });
});

describe("wishlist store — addItem", () => {
  it("adds a new product id", () => {
    useWishlistStore.getState().addItem("p1");
    expect(useWishlistStore.getState().items).toContain("p1");
  });

  it("does not duplicate an existing id", () => {
    const { addItem } = useWishlistStore.getState();
    addItem("p1");
    addItem("p1");
    expect(useWishlistStore.getState().items).toHaveLength(1);
  });

  it("can add multiple different products", () => {
    const { addItem } = useWishlistStore.getState();
    addItem("p1");
    addItem("p2");
    addItem("p3");
    expect(useWishlistStore.getState().items).toHaveLength(3);
  });
});

describe("wishlist store — removeItem", () => {
  it("removes an existing product id", () => {
    const { addItem, removeItem } = useWishlistStore.getState();
    addItem("p1");
    addItem("p2");
    removeItem("p1");
    expect(useWishlistStore.getState().items).not.toContain("p1");
    expect(useWishlistStore.getState().items).toContain("p2");
  });

  it("is a no-op for non-existent id", () => {
    useWishlistStore.getState().addItem("p1");
    useWishlistStore.getState().removeItem("p999");
    expect(useWishlistStore.getState().items).toHaveLength(1);
  });
});

describe("wishlist store — isInWishlist", () => {
  it("returns true for an added product", () => {
    useWishlistStore.getState().addItem("p1");
    expect(useWishlistStore.getState().isInWishlist("p1")).toBe(true);
  });

  it("returns false for a product not in the list", () => {
    expect(useWishlistStore.getState().isInWishlist("p999")).toBe(false);
  });

  it("returns false after product is removed", () => {
    const { addItem, removeItem, isInWishlist } = useWishlistStore.getState();
    addItem("p1");
    removeItem("p1");
    expect(isInWishlist("p1")).toBe(false);
  });
});
