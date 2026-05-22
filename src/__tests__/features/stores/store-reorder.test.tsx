import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UserRole } from "@/enums";
import { AdminStoreList } from "@/features/stores/components/admin-store-list";
import * as storeApi from "@/features/stores/api";

const mockUseAdminStores = jest.fn();
const mockUseAuthStore = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) => mockUseAuthStore(selector),
}));

jest.mock("@/features/stores/hooks", () => ({
  useAdminStores: (options: unknown) => mockUseAdminStores(options),
}));

jest.mock("@/features/stores/api", () => ({
  deleteStore: jest.fn(),
  reorderStores: jest.fn(),
  updateStoreStatus: jest.fn(),
}));

const mockReorderStores = storeApi.reorderStores as jest.MockedFunction<
  typeof storeApi.reorderStores
>;

const stores = [
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
];

describe("store reorder flow", () => {
  beforeEach(() => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ user: { roles: [UserRole.Staff] } })
    );
    mockUseAdminStores.mockReturnValue({
      data: stores,
      loading: false,
      error: null,
      metadata: null,
      refetch: jest.fn().mockResolvedValue(undefined),
    });
    mockReorderStores.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("allows staff to reorder while hiding write actions", async () => {
    render(<AdminStoreList />);

    expect(screen.queryByLabelText("edit")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("delete")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "reorder" }));
    fireEvent.click(screen.getByRole("button", { name: "moveDown Morii D1" }));
    fireEvent.click(screen.getByRole("button", { name: "saveOrder" }));

    await waitFor(() => {
      expect(mockReorderStores).toHaveBeenCalledWith({
        items: [
          { id: "store-2", displayOrder: 1 },
          { id: "store-1", displayOrder: 2 },
        ],
      });
    });
  });
});
