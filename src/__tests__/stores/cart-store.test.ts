import { useCartStore } from "@/stores/cart-store";

const makeItem = (productId: string, size?: string, price = 50000) => ({
  productId,
  name: `Product ${productId}`,
  price,
  image: "/placeholder.png",
  size,
});

beforeEach(() => {
  useCartStore.setState({
    items: [],
    storageMode: "guest",
    isReady: true,
    syncError: null,
  });
});

describe("cart store — addItem", () => {
  it("adds a new item with quantity 1", () => {
    useCartStore.getState().addItem(makeItem("p1"));
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(1);
  });

  it("increments quantity for existing product+size combination", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeItem("p1", "Medium"));
    addItem(makeItem("p1", "Medium"));
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
  });

  it("treats same productId with different size as separate entry", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeItem("p1", "Small"));
    addItem(makeItem("p1", "Large"));
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("treats item without size independently from one with size", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeItem("p1"));
    addItem(makeItem("p1", "Medium"));
    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

describe("cart store — removeItem", () => {
  it("removes the matching item", () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem(makeItem("p1"));
    addItem(makeItem("p2"));
    removeItem("p1");
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].productId).toBe("p2");
  });

  it("removes the correct size variant", () => {
    const { addItem, removeItem } = useCartStore.getState();
    addItem(makeItem("p1", "Small"));
    addItem(makeItem("p1", "Large"));
    removeItem("p1", "Small");
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].size).toBe("Large");
  });
});

describe("cart store — updateQuantity", () => {
  it("updates the quantity of a matching item", () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(makeItem("p1"));
    updateQuantity("p1", 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it("removes item when quantity set to 0", () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(makeItem("p1"));
    updateQuantity("p1", 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removes item when quantity set to negative", () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(makeItem("p1"));
    updateQuantity("p1", -1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("updates only the matching size variant", () => {
    const { addItem, updateQuantity } = useCartStore.getState();
    addItem(makeItem("p1", "Small"));
    addItem(makeItem("p1", "Large"));
    updateQuantity("p1", 10, "Small");
    const items = useCartStore.getState().items;
    expect(items.find((i) => i.size === "Small")?.quantity).toBe(10);
    expect(items.find((i) => i.size === "Large")?.quantity).toBe(1);
  });
});

describe("cart store — clearCart", () => {
  it("empties all items", () => {
    const { addItem, clearCart } = useCartStore.getState();
    addItem(makeItem("p1"));
    addItem(makeItem("p2"));
    clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe("cart store — changeVariant", () => {
  it("replaces the item with the selected variant in guest mode", async () => {
    const { addItem, changeVariant } = useCartStore.getState();

    await addItem({
      productId: "p1",
      variantId: "variant-small",
      size: "Small",
      name: "A-ME Classic",
      price: 39000,
      image: "/placeholder.png",
    });

    await changeVariant(
      useCartStore.getState().items[0],
      {
        productId: "p1",
        variantId: "variant-medium",
        size: "Medium",
        name: "A-ME Classic",
        price: 45000,
        quantity: 1,
        image: "/placeholder.png",
      }
    );

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({
        productId: "p1",
        variantId: "variant-medium",
        size: "Medium",
        price: 45000,
        quantity: 1,
      }),
    ]);
  });

  it("merges quantity when changing to an existing variant in guest mode", async () => {
    const { addItem, changeVariant } = useCartStore.getState();

    await addItem({
      productId: "p1",
      variantId: "variant-small",
      size: "Small",
      name: "A-ME Classic",
      price: 39000,
      image: "/placeholder.png",
    });

    await addItem({
      productId: "p1",
      variantId: "variant-medium",
      size: "Medium",
      name: "A-ME Classic",
      price: 45000,
      image: "/placeholder.png",
    });

    await changeVariant(
      useCartStore.getState().items.find((item) => item.variantId === "variant-small")!,
      {
        productId: "p1",
        variantId: "variant-medium",
        size: "Medium",
        name: "A-ME Classic",
        price: 45000,
        quantity: 1,
        image: "/placeholder.png",
      }
    );

    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0]).toEqual(
      expect.objectContaining({
        variantId: "variant-medium",
        quantity: 2,
      })
    );
  });
});

describe("cart store — totalItems", () => {
  it("returns 0 for empty cart", () => {
    expect(useCartStore.getState().totalItems()).toBe(0);
  });

  it("sums all item quantities", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeItem("p1"));
    addItem(makeItem("p1"));
    addItem(makeItem("p2"));
    expect(useCartStore.getState().totalItems()).toBe(3);
  });
});

describe("cart store — totalPrice", () => {
  it("returns 0 for empty cart", () => {
    expect(useCartStore.getState().totalPrice()).toBe(0);
  });

  it("computes price × quantity for each item", () => {
    const { addItem } = useCartStore.getState();
    addItem(makeItem("p1", undefined, 50000));
    addItem(makeItem("p1", undefined, 50000)); // increments to qty 2
    addItem(makeItem("p2", undefined, 30000));
    // p1: 50000 × 2 = 100000, p2: 30000 × 1 = 30000
    expect(useCartStore.getState().totalPrice()).toBe(130000);
  });
});
