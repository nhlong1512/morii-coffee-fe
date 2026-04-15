import { renderHook, waitFor } from "@testing-library/react";
import { useBanners } from "@/hooks/use-banners";
import * as bannersService from "@/services/banners-service";

jest.mock("@/services/banners-service");

const mockGetBanners = bannersService.getBanners as jest.MockedFunction<
  typeof bannersService.getBanners
>;

const mockBanners = [
  { id: "1", displayOrder: 2, title: "Banner B" },
  { id: "2", displayOrder: 1, title: "Banner A" },
  { id: "3", displayOrder: 3, title: "Banner C" },
] as any[];

describe("useBanners", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("starts in loading state", () => {
    mockGetBanners.mockResolvedValue(mockBanners);
    const { result } = renderHook(() => useBanners());
    expect(result.current.loading).toBe(true);
  });

  it("sets loading to false after data loads", async () => {
    mockGetBanners.mockResolvedValue(mockBanners);
    const { result } = renderHook(() => useBanners());
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it("populates banners on success", async () => {
    mockGetBanners.mockResolvedValue(mockBanners);
    const { result } = renderHook(() => useBanners());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.banners).toHaveLength(3);
  });

  it("sorts banners by displayOrder ascending", async () => {
    mockGetBanners.mockResolvedValue(mockBanners);
    const { result } = renderHook(() => useBanners());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.banners[0].displayOrder).toBe(1);
    expect(result.current.banners[1].displayOrder).toBe(2);
    expect(result.current.banners[2].displayOrder).toBe(3);
  });

  it("sets error message when service throws", async () => {
    mockGetBanners.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useBanners());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Network error");
  });

  it("uses fallback error message for non-Error throws", async () => {
    mockGetBanners.mockRejectedValue("unknown");
    const { result } = renderHook(() => useBanners());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load banners");
  });

  it("refetch re-calls the service", async () => {
    mockGetBanners.mockResolvedValue(mockBanners);
    const { result } = renderHook(() => useBanners());
    await waitFor(() => expect(result.current.loading).toBe(false));
    await result.current.refetch();
    expect(mockGetBanners).toHaveBeenCalledTimes(2);
  });
});
