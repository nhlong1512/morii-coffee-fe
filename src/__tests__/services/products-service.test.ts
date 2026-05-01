import type {
  ApiPagination,
  ApiProductDetail,
  ApiProductSummary,
} from "@/types/api";
import { ProductSize, ProductStatus } from "@/enums";

const apiGetMock = jest.fn();

jest.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => {
  jest.resetModules();
  apiGetMock.mockReset();
});

describe("products-service", () => {
  it("resolves quick-add cart payload from the default product variant", async () => {
    const summaryResponse: ApiPagination<ApiProductSummary> = {
      items: [
        {
          id: "product-1",
          name: "Caramel Latte",
          slug: "caramel-latte",
          basePrice: 45000,
          categoryNames: ["latte"],
          thumbnailUrl: "/thumb.jpg",
          status: ProductStatus.Active,
          isFeatured: false,
          displayOrder: 1,
          createdAt: "2026-01-01T00:00:00Z",
        },
      ],
      metadata: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 1,
        totalCount: 1,
        payloadSize: 1,
        hasPrevious: false,
        hasNext: false,
        takeAll: true,
      },
    };

    const detailResponse: ApiProductDetail = {
      id: "product-1",
      name: "Caramel Latte",
      slug: "caramel-latte",
      description: "Rich caramel flavor",
      basePrice: 45000,
      categories: [],
      thumbnailUrl: "/thumb.jpg",
      status: ProductStatus.Active,
      isFeatured: false,
      displayOrder: 1,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: null,
      variants: [
        {
          id: "variant-default",
          productId: "product-1",
          name: "Medium",
          size: ProductSize.Medium,
          additionalPrice: 5000,
          totalPrice: 50000,
          sku: null,
          stockQuantity: 10,
          isDefault: true,
          isAvailable: true,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
      images: [],
    };

    apiGetMock
      .mockResolvedValueOnce(summaryResponse)
      .mockResolvedValueOnce(detailResponse);

    const { getAllProducts, resolveCartItemInput } = await import("@/services/products-service");
    const [product] = await getAllProducts();
    const cartItem = await resolveCartItemInput(product);

    expect(apiGetMock).toHaveBeenNthCalledWith(1, "/v1/products?takeAll=true");
    expect(apiGetMock).toHaveBeenNthCalledWith(2, "/v1/products/product-1");
    expect(cartItem).toEqual({
      productId: "product-1",
      name: "Caramel Latte",
      price: 50000,
      variantId: "variant-default",
      size: "Medium",
      image: "/thumb.jpg",
    });
  });
});
