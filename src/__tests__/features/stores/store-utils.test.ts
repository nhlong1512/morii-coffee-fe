import { UserRole } from "@/enums";
import {
  buildReorderStoresRequest,
  buildStoreFormValues,
  buildUpsertStoreRequest,
  deriveAvailableCities,
  formatDistanceKm,
  getStoreAvailability,
  getStorePermissions,
  sortStoresForDisplay,
} from "@/features/stores/utils";
import type { StoreLocation } from "@/features/stores";

const baseStore: StoreLocation = {
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
  email: "hello@morii.vn",
  coverImageUrl: null,
  isActive: true,
  displayOrder: 2,
  distanceKm: null,
  openingHours: [
    { id: "0", dayOfWeek: 0, openTime: "07:00", closeTime: "21:00", isClosed: true },
    { id: "1", dayOfWeek: 1, openTime: "07:00", closeTime: "21:00", isClosed: false },
    { id: "2", dayOfWeek: 2, openTime: "07:00", closeTime: "21:00", isClosed: false },
    { id: "3", dayOfWeek: 3, openTime: "07:00", closeTime: "21:00", isClosed: false },
    { id: "4", dayOfWeek: 4, openTime: "07:00", closeTime: "21:00", isClosed: false },
    { id: "5", dayOfWeek: 5, openTime: "07:00", closeTime: "21:00", isClosed: false },
    { id: "6", dayOfWeek: 6, openTime: "07:00", closeTime: "21:00", isClosed: false },
  ],
  createdAt: "2026-05-01T00:00:00Z",
  updatedAt: null,
};

describe("store utils", () => {
  it("derives store availability for open and closed states", () => {
    expect(
      getStoreAvailability(baseStore, new Date(2026, 4, 24, 10, 0, 0))
    ).toEqual(
      expect.objectContaining({
        isOpenNow: false,
        isClosedToday: true,
        todayHoursLabel: "Closed today",
      })
    );

    expect(
      getStoreAvailability(baseStore, new Date(2026, 4, 25, 9, 0, 0))
    ).toEqual(
      expect.objectContaining({
        isOpenNow: true,
        isClosedToday: false,
        closesAt: "21:00",
      })
    );
  });

  it("derives available cities and formats distances", () => {
    expect(
      deriveAvailableCities([
        baseStore,
        { ...baseStore, id: "store-2", city: "Da Nang" },
        { ...baseStore, id: "store-3", city: "Ho Chi Minh City" },
      ])
    ).toEqual(["Da Nang", "Ho Chi Minh City"]);

    expect(formatDistanceKm(null)).toBeNull();
    expect(formatDistanceKm(0.453)).toBe("0.45");
    expect(formatDistanceKm(2.45)).toBe("2.5");
  });

  it("builds form values and upsert payloads", () => {
    const formValues = buildStoreFormValues(baseStore);

    expect(formValues).toEqual(
      expect.objectContaining({
        name: "Morii D1",
        latitude: "10.77",
        longitude: "106.7",
        displayOrder: "2",
      })
    );

    expect(buildUpsertStoreRequest(formValues)).toEqual(
      expect.objectContaining({
        name: "Morii D1",
        latitude: 10.77,
        longitude: 106.7,
        displayOrder: 2,
      })
    );
  });

  it("builds reorder payloads and display ordering", () => {
    const stores = [
      { ...baseStore, id: "store-1", displayOrder: 3, distanceKm: null, name: "B" },
      { ...baseStore, id: "store-2", displayOrder: 1, distanceKm: null, name: "A" },
      { ...baseStore, id: "store-3", displayOrder: 2, distanceKm: 0.5, name: "C" },
    ];

    expect(buildReorderStoresRequest(stores)).toEqual({
      items: [
        { id: "store-1", displayOrder: 1 },
        { id: "store-2", displayOrder: 2 },
        { id: "store-3", displayOrder: 3 },
      ],
    });

    expect(sortStoresForDisplay(stores).map((store) => store.id)).toEqual([
      "store-2",
      "store-3",
      "store-1",
    ]);
  });

  it("derives permissions from roles", () => {
    expect(getStorePermissions([UserRole.Admin])).toEqual({
      canAccessAdminStores: true,
      canWriteStores: true,
      canReorderStores: true,
    });

    expect(getStorePermissions([UserRole.Staff])).toEqual({
      canAccessAdminStores: true,
      canWriteStores: false,
      canReorderStores: true,
    });
  });
});
