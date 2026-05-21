import type { ApiCart, ApiCartItem } from "@/types/api";

const apiDeleteMock = jest.fn();
const apiGetMock = jest.fn();
const apiPostMock = jest.fn();
const apiPutMock = jest.fn();

jest.mock("@/lib/api", () => ({
  apiDelete: (...args: unknown[]) => apiDeleteMock(...args),
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPost: (...args: unknown[]) => apiPostMock(...args),
  apiPut: (...args: unknown[]) => apiPutMock(...args),
}));

beforeEach(() => {
  jest.resetModules();
  apiDeleteMock.mockReset();
  apiGetMock.mockReset();
  apiPostMock.mockReset();
  apiPutMock.mockReset();
});

describe("cart-service", () => {
  it("posts guestItems merge payload instead of falling back to getCart", async () => {
    const response: ApiCart = {
      items: [],
      updatedAt: "2026-05-02T00:00:00Z",
    };

    apiPostMock.mockResolvedValue(response);

    const { mergeCart } = await import("@/services/cart-service");
    const result = await mergeCart([]);

    expect(apiPostMock).toHaveBeenCalledWith("/v1/cart/merge", { guestItems: [] });
    expect(apiGetMock).not.toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it("uses body-based update and delete cart endpoints", async () => {
    const { removeCartItem, updateCartItem } = await import("@/services/cart-service");

    await updateCartItem({
      productId: "product-1",
      variantId: "variant-1",
      quantity: 3,
      name: "Latte",
      price: 45000,
      size: "Medium",
      image: "/latte.jpg",
    });

    await removeCartItem("cart-item-1", "product-1", "variant-1");

    expect(apiPutMock).toHaveBeenCalledWith("/v1/cart/items", {
      productId: "product-1",
      variantId: "variant-1",
      quantity: 3,
    });

    expect(apiDeleteMock).toHaveBeenCalledWith("/v1/cart/items", {
      body: JSON.stringify({
        productId: "product-1",
        variantId: "variant-1",
      }),
      headers: { "Content-Type": "application/json" },
    });
  });

  it("normalizes backend cart size labels", async () => {
    const item: ApiCartItem = {
      id: "cart-item-1",
      productId: "product-1",
      variantId: "variant-1",
      variantLabel: "Nhỏ",
      productName: "A-ME Classic",
      unitPrice: 39000,
      quantity: 2,
      imageUrl: "/ame.jpg",
      addedAt: "2026-05-02T00:00:00Z",
    };

    const { mapApiCartItem } = await import("@/services/cart-service");

    expect(mapApiCartItem(item).size).toBe("Small");
  });
});
