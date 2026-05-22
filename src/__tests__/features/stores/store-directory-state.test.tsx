import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { UserRole } from "@/enums";
import { AdminStoreList } from "@/features/stores/components/admin-store-list";

const mockUseAdminStores = jest.fn();
const mockUseAuthStore = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/stores/auth-store", () => ({
  useAuthStore: (selector: (state: unknown) => unknown) => mockUseAuthStore(selector),
}));

jest.mock("@/features/stores/hooks", () => ({
  useAdminStores: (options: {
    search?: string;
  }) => mockUseAdminStores(options),
}));

jest.mock("@/features/stores/api", () => ({
  deleteStore: jest.fn(),
  reorderStores: jest.fn(),
  updateStoreStatus: jest.fn(),
}));

jest.mock("@/components/admin/data-table", () => ({
  DataTable: ({ data }: { data: Array<{ id: string }> }) => (
    <div data-testid="store-table">{data.length}</div>
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
  }: {
    children: ReactNode;
  }) => <div>{children}</div>,
  SelectTrigger: ({
    children,
  }: {
    children: ReactNode;
  }) => <div>{children}</div>,
  SelectValue: ({
    placeholder,
  }: {
    placeholder?: string;
  }) => <span>{placeholder}</span>,
  SelectContent: ({
    children,
  }: {
    children: ReactNode;
  }) => <div>{children}</div>,
  SelectItem: ({
    children,
  }: {
    children: ReactNode;
    value: string;
  }) => <div>{children}</div>,
}));

describe("store directory state", () => {
  const allStores = [
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

  beforeEach(() => {
    mockUseAuthStore.mockImplementation((selector) =>
      selector({ user: { roles: [UserRole.Admin] } })
    );

    mockUseAdminStores.mockImplementation((options: { search?: string }) => {
      return {
        data: options.search === "missing" ? [] : allStores,
        loading: false,
        error: null,
        metadata: null,
        refetch: jest.fn().mockResolvedValue(undefined),
      };
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("requests the default directory state and renders current results", async () => {
    render(<AdminStoreList />);

    await waitFor(() => {
      expect(mockUseAdminStores).toHaveBeenCalledWith(
        expect.objectContaining({
          search: undefined,
          city: undefined,
          isActive: undefined,
          takeAll: true,
        })
      );
      expect(screen.getByTestId("store-table")).toHaveTextContent("1");
    });
  });
});
