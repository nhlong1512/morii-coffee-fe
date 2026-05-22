import {
  createStore,
  deleteStore,
  getAdminStoreById,
  getAdminStores,
  getPublicStoreById,
  getPublicStores,
  reorderStores,
  updateStore,
  updateStoreStatus,
} from "@/features/stores/api";
import * as api from "@/lib/api";

jest.mock("@/lib/api", () => ({
  apiDelete: jest.fn(),
  apiGet: jest.fn(),
  apiPatch: jest.fn(),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
}));

const mockApiDelete = api.apiDelete as jest.MockedFunction<typeof api.apiDelete>;
const mockApiGet = api.apiGet as jest.MockedFunction<typeof api.apiGet>;
const mockApiPatch = api.apiPatch as jest.MockedFunction<typeof api.apiPatch>;
const mockApiPost = api.apiPost as jest.MockedFunction<typeof api.apiPost>;
const mockApiPut = api.apiPut as jest.MockedFunction<typeof api.apiPut>;

describe("store api", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("builds the public stores query string", async () => {
    mockApiGet.mockResolvedValue({ items: [], metadata: null } as never);

    await getPublicStores({
      takeAll: true,
      search: "district 1",
      city: "HCMC",
      latitude: 10.77,
      longitude: 106.7,
      radius: 5,
    });

    expect(mockApiGet).toHaveBeenCalledWith(
      "/v1/stores?takeAll=true&search=district+1&city=HCMC&latitude=10.77&longitude=106.7&radius=5"
    );
  });

  it("builds the admin stores query string", async () => {
    mockApiGet.mockResolvedValue({ items: [], metadata: null } as never);

    await getAdminStores({
      page: 2,
      size: 20,
      isActive: false,
      city: "Da Nang",
    });

    expect(mockApiGet).toHaveBeenCalledWith(
      "/v1/admin/stores?page=2&size=20&city=Da+Nang&isActive=false"
    );
  });

  it("loads public and admin store details", async () => {
    mockApiGet.mockResolvedValue({ id: "store-1" } as never);

    await getPublicStoreById("store-1");
    await getAdminStoreById("store-1");

    expect(mockApiGet).toHaveBeenNthCalledWith(1, "/v1/stores/store-1");
    expect(mockApiGet).toHaveBeenNthCalledWith(2, "/v1/admin/stores/store-1");
  });

  it("calls create, update, status, reorder, and delete endpoints", async () => {
    const payload = {
      name: "Morii D1",
      slug: "morii-d1",
      address: "42 Nguyen Hue",
      district: "District 1",
      city: "HCMC",
      province: "HCMC",
      latitude: 10.77,
      longitude: 106.7,
      phone: "0900000000",
      email: null,
      coverImageUrl: null,
      isActive: true,
      displayOrder: 1,
      openingHours: [],
    };

    mockApiPost.mockResolvedValue({ id: "store-1" } as never);
    mockApiPut.mockResolvedValue({ id: "store-1" } as never);
    mockApiPatch.mockResolvedValue({ id: "store-1" } as never);
    mockApiDelete.mockResolvedValue(undefined as never);

    await createStore(payload);
    await updateStore("store-1", payload);
    await updateStoreStatus("store-1", { isActive: false });
    await reorderStores({
      items: [{ id: "store-1", displayOrder: 1 }],
    });
    await deleteStore("store-1");

    expect(mockApiPost).toHaveBeenCalledWith("/v1/admin/stores", payload);
    expect(mockApiPut).toHaveBeenCalledWith("/v1/admin/stores/store-1", payload);
    expect(mockApiPatch).toHaveBeenNthCalledWith(
      1,
      "/v1/admin/stores/store-1/status",
      { isActive: false }
    );
    expect(mockApiPatch).toHaveBeenNthCalledWith(
      2,
      "/v1/admin/stores/reorder",
      { items: [{ id: "store-1", displayOrder: 1 }] }
    );
    expect(mockApiDelete).toHaveBeenCalledWith("/v1/admin/stores/store-1");
  });
});
