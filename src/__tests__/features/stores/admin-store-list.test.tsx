import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UserRole } from "@/enums";
import { AdminStoreList } from "@/features/stores/components/admin-store-list";
import * as storeApi from "@/features/stores/api";

const mockUseAdminStores = jest.fn();
const mockUseAuthStore = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string | number>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
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

const mockDeleteStore = storeApi.deleteStore as jest.MockedFunction<typeof storeApi.deleteStore>;
const mockUpdateStoreStatus = storeApi.updateStoreStatus as jest.MockedFunction<
  typeof storeApi.updateStoreStatus
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
];

describe("AdminStoreList", () => {
  beforeEach(() => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ user: { roles: [UserRole.Admin] } })
    );
    mockUseAdminStores.mockReturnValue({
      data: stores,
      loading: false,
      error: null,
      metadata: null,
      refetch: jest.fn().mockResolvedValue(undefined),
    });
    mockDeleteStore.mockResolvedValue(undefined);
    mockUpdateStoreStatus.mockResolvedValue({ ...stores[0], isActive: false } as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders admin actions for admins", () => {
    render(<AdminStoreList />);

    expect(screen.getByRole("link", { name: "addStore" })).toBeInTheDocument();
    expect(screen.getByLabelText("edit")).toBeInTheDocument();
    expect(screen.getByLabelText("delete")).toBeInTheDocument();
  });

  it("retries after a load error", () => {
    const refetch = jest.fn().mockResolvedValue(undefined);
    mockUseAdminStores.mockReturnValue({
      data: [],
      loading: false,
      error: "Forbidden",
      metadata: null,
      refetch,
    });

    render(<AdminStoreList />);
    fireEvent.click(screen.getByRole("button", { name: "retry" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("toggles store status and confirms deletion", async () => {
    render(<AdminStoreList />);

    fireEvent.click(screen.getByLabelText("toggleActive"));
    await waitFor(() => {
      expect(mockUpdateStoreStatus).toHaveBeenCalledWith("store-1", { isActive: false });
    });

    fireEvent.click(screen.getByLabelText("delete"));
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(mockDeleteStore).toHaveBeenCalledWith("store-1");
    });
  });
});
