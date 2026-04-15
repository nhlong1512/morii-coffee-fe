import { renderHook, waitFor } from "@testing-library/react";
import { useCategories } from "@/hooks/use-categories";
import * as categoriesService from "@/services/categories-service";

jest.mock("@/services/categories-service");

const mockGetCategories = categoriesService.getCategories as jest.MockedFunction<
  typeof categoriesService.getCategories
>;

const mockCategories = [
  { id: "1", displayOrder: 3, name: "C" },
  { id: "2", displayOrder: 1, name: "A" },
  { id: "3", displayOrder: 2, name: "B" },
] as any[];

describe("useCategories", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("starts in loading state", () => {
    mockGetCategories.mockResolvedValue(mockCategories);
    const { result } = renderHook(() => useCategories());
    expect(result.current.loading).toBe(true);
  });

  it("sets loading to false after data loads", async () => {
    mockGetCategories.mockResolvedValue(mockCategories);
    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("populates categories on success", async () => {
    mockGetCategories.mockResolvedValue(mockCategories);
    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toHaveLength(3);
  });

  it("sorts categories by displayOrder ascending", async () => {
    mockGetCategories.mockResolvedValue(mockCategories);
    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories[0].displayOrder).toBe(1);
    expect(result.current.categories[1].displayOrder).toBe(2);
    expect(result.current.categories[2].displayOrder).toBe(3);
  });

  it("sets error message when service throws", async () => {
    mockGetCategories.mockRejectedValue(new Error("Failed"));
    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed");
  });

  it("uses fallback error message for non-Error throws", async () => {
    mockGetCategories.mockRejectedValue("oops");
    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load categories");
  });

  it("refetch re-calls the service", async () => {
    mockGetCategories.mockResolvedValue(mockCategories);
    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.refetch();
    expect(mockGetCategories).toHaveBeenCalledTimes(2);
  });
});
