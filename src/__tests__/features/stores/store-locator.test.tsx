import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StoreLocator } from "@/features/stores/components/store-locator";
import type { StoreLocation } from "@/features/stores";

const mockUsePublicStores = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}));

jest.mock("@/features/stores/hooks", () => {
  const actual = jest.requireActual("@/features/stores/hooks");
  return {
    ...actual,
    usePublicStores: (options: unknown) => mockUsePublicStores(options),
  };
});

jest.mock("@/features/stores/components/store-locator-map", () => ({
  StoreLocatorMap: ({
    stores,
    selectedStoreId,
  }: {
    stores: StoreLocation[];
    selectedStoreId: string | null;
  }) => <div data-testid="map-state">{`${selectedStoreId}:${stores.length}`}</div>,
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
    displayOrder: 2,
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
    displayOrder: 1,
    distanceKm: null,
    openingHours: [],
    createdAt: "2026-05-01T00:00:00Z",
    updatedAt: null,
  },
];

describe("StoreLocator", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders live stores, filters by search, and syncs selection", async () => {
    mockUsePublicStores.mockReturnValue({
      data: stores,
      loading: false,
      error: null,
      metadata: null,
      refetch: jest.fn(),
    });

    render(<StoreLocator />);

    expect(screen.getByText("Morii D1")).toBeInTheDocument();
    expect(screen.getByText("Morii Hanoi")).toBeInTheDocument();
    expect(screen.getByTestId("map-state")).toHaveTextContent("store-2:2");

    fireEvent.change(screen.getByPlaceholderText("searchPlaceholder"), {
      target: { value: "Nguyen Hue" },
    });

    await waitFor(() => {
      expect(screen.getByText("Morii D1")).toBeInTheDocument();
      expect(screen.queryByText("Morii Hanoi")).not.toBeInTheDocument();
      expect(screen.getByTestId("map-state")).toHaveTextContent("store-1:1");
    });
  });

  it("renders an error state and retries", () => {
    const refetch = jest.fn();
    mockUsePublicStores.mockReturnValue({
      data: [],
      loading: false,
      error: "Forbidden",
      metadata: null,
      refetch,
    });

    render(<StoreLocator />);

    fireEvent.click(screen.getByRole("button", { name: "retry" }));
    expect(refetch).toHaveBeenCalled();
  });
});
