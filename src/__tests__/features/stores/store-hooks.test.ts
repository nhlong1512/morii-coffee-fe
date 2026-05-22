import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useAdminStore,
  useAdminStores,
  usePublicStores,
  useStoreLocatorState,
} from "@/features/stores/hooks";
import * as storeApi from "@/features/stores/api";

jest.mock("@/features/stores/api");

const mockGetAdminStoreById = storeApi.getAdminStoreById as jest.MockedFunction<
  typeof storeApi.getAdminStoreById
>;
const mockGetAdminStores = storeApi.getAdminStores as jest.MockedFunction<
  typeof storeApi.getAdminStores
>;
const mockGetPublicStores = storeApi.getPublicStores as jest.MockedFunction<
  typeof storeApi.getPublicStores
>;

const storesPage = {
  items: [
    {
      id: "store-1",
      name: "Morii D1",
      slug: "morii-d1",
      address: "42 Nguyen Hue",
      district: "District 1",
      city: "Ho Chi Minh City",
      province: "Ho Chi Minh City",
      latitude: 10.77,
      longitude: 106.7,
      phone: "0900000000",
      email: null,
      coverImageUrl: null,
      isActive: true,
      displayOrder: 1,
      distanceKm: null,
      openingHours: [],
      createdAt: "2026-05-01T00:00:00Z",
      updatedAt: null,
    },
  ],
  metadata: {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalCount: 1,
    payloadSize: 1,
    hasPrevious: false,
    hasNext: false,
    takeAll: true,
  },
};

describe("store hooks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads public stores", async () => {
    mockGetPublicStores.mockResolvedValue(storesPage as never);

    const { result } = renderHook(() => usePublicStores({ takeAll: true }));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.metadata?.totalCount).toBe(1);
  });

  it("loads admin stores and individual admin stores", async () => {
    mockGetAdminStores.mockResolvedValue(storesPage as never);
    mockGetAdminStoreById.mockResolvedValue(storesPage.items[0] as never);

    const { result: listResult } = renderHook(() => useAdminStores({ takeAll: true }));
    const { result: detailResult } = renderHook(() => useAdminStore("store-1"));

    await waitFor(() => expect(listResult.current.loading).toBe(false));
    await waitFor(() => expect(detailResult.current.loading).toBe(false));

    expect(listResult.current.data[0]?.id).toBe("store-1");
    expect(detailResult.current.data?.id).toBe("store-1");
  });

  it("does not fetch admin store detail when id is null", async () => {
    const { result } = renderHook(() => useAdminStore(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(mockGetAdminStoreById).not.toHaveBeenCalled();
  });

  it("handles near-me success and geolocation failures", async () => {
    Object.defineProperty(global.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: jest.fn((onSuccess: (position: GeolocationPosition) => void) =>
          onSuccess({
            coords: {
              latitude: 10.78,
              longitude: 106.69,
            },
          } as GeolocationPosition)
        ),
      },
    });

    const { result, rerender } = renderHook(() => useStoreLocatorState(storesPage.items));

    await act(async () => {
      await result.current.requestNearMe();
    });

    expect(result.current.isNearMeActive).toBe(true);
    expect(result.current.userLatitude).toBe(10.78);
    expect(result.current.availableCities).toEqual(["Ho Chi Minh City"]);

    Object.defineProperty(global.navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: jest.fn(
          (
            _onSuccess: (position: GeolocationPosition) => void,
            onError: (error: GeolocationPositionError) => void
          ) => onError({ message: "permission denied" } as GeolocationPositionError)
        ),
      },
    });

    rerender();

    await act(async () => {
      await result.current.requestNearMe();
    });

    expect(result.current.geolocationError).toBe("permission denied");
  });
});
