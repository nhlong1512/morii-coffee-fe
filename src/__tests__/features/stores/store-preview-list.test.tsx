import { render, screen } from "@testing-library/react";
import { StoreLocatorPreviewList } from "@/features/stores/components/store-preview-list";
import type { StoreLocation } from "@/features/stores";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

const stores: StoreLocation[] = [
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
    displayOrder: 3,
    distanceKm: null,
    openingHours: [],
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "store-2",
    name: "Morii Hanoi",
    slug: "morii-hanoi",
    address: "8 Ma May",
    district: "Hoan Kiem",
    city: "Hanoi",
    province: "Hanoi",
    latitude: 21.03,
    longitude: 105.85,
    phone: "0900000001",
    email: null,
    coverImageUrl: null,
    isActive: true,
    displayOrder: 2,
    distanceKm: null,
    openingHours: [],
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: null,
  },
  {
    id: "store-3",
    name: "Morii Da Nang",
    slug: "morii-da-nang",
    address: "120 Bach Dang",
    district: "Hai Chau",
    city: "Da Nang",
    province: "Da Nang",
    latitude: 16.06,
    longitude: 108.22,
    phone: "0900000002",
    email: null,
    coverImageUrl: null,
    isActive: true,
    displayOrder: 1,
    distanceKm: 0.4,
    openingHours: [],
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: null,
  },
];

describe("StoreLocatorPreviewList", () => {
  it("limits and sorts preview items", () => {
    render(<StoreLocatorPreviewList stores={stores} limit={2} />);

    expect(screen.getByText("Morii Da Nang")).toBeInTheDocument();
    expect(screen.getByText("Morii Hanoi")).toBeInTheDocument();
    expect(screen.queryByText("Morii D1")).not.toBeInTheDocument();
  });

  it("renders the empty state when no stores are available", () => {
    render(<StoreLocatorPreviewList stores={[]} />);
    expect(screen.getByText("noResultsTitle")).toBeInTheDocument();
  });
});
