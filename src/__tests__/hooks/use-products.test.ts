import { renderHook, waitFor } from "@testing-library/react";
import { useProducts } from "@/hooks/use-products";
import * as productsService from "@/services/products-service";

jest.mock("@/services/products-service");

const mockGetProducts = productsService.getProducts as jest.MockedFunction<
  typeof productsService.getProducts
>;

const mockResult = {
  products: [
    { id: "p1", name: "Coffee A" },
    { id: "p2", name: "Coffee B" },
  ],
  hasNext: true,
  totalCount: 20,
};

describe("useProducts", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("starts in loading state", () => {
    mockGetProducts.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useProducts());
    expect(result.current.loading).toBe(true);
  });

  it("sets loading to false after data loads", async () => {
    mockGetProducts.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("populates products on success", async () => {
    mockGetProducts.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(2);
  });

  it("sets hasNext from service response", async () => {
    mockGetProducts.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasNext).toBe(true);
  });

  it("sets totalCount from service response", async () => {
    mockGetProducts.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.totalCount).toBe(20);
  });

  it("sets error message when service throws", async () => {
    mockGetProducts.mockRejectedValue(new Error("Not found"));
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Not found");
  });

  it("uses fallback error message for non-Error throws", async () => {
    mockGetProducts.mockRejectedValue("fail");
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load products");
  });

  it("refetch re-calls the service", async () => {
    mockGetProducts.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.refetch();
    expect(mockGetProducts).toHaveBeenCalledTimes(2);
  });
});
