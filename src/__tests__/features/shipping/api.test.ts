import {
  cancelShipmentForOrder,
  createShipmentForOrder,
  createShippingQuote,
  getShipmentSummary,
  getShippingDistricts,
  getShippingProvinces,
  getShippingWards,
  requoteShipmentForOrder,
  syncShipmentForOrder,
  updateShipmentNoteForOrder,
} from "@/features/shipping/api";
import * as api from "@/lib/api";

jest.mock("@/lib/api", () => ({
  apiGet: jest.fn(),
  apiPost: jest.fn(),
  apiPatch: jest.fn(),
}));

const mockApiGet = api.apiGet as jest.MockedFunction<typeof api.apiGet>;
const mockApiPost = api.apiPost as jest.MockedFunction<typeof api.apiPost>;
const mockApiPatch = api.apiPatch as jest.MockedFunction<typeof api.apiPatch>;

describe("shipping api", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads GHN master data", async () => {
    mockApiGet.mockResolvedValue([] as never);

    await getShippingProvinces();
    await getShippingDistricts(202);
    await getShippingWards(1461);

    expect(mockApiGet).toHaveBeenNthCalledWith(1, "/v1/shipping/ghn/provinces");
    expect(mockApiGet).toHaveBeenNthCalledWith(
      2,
      "/v1/shipping/ghn/districts?provinceId=202"
    );
    expect(mockApiGet).toHaveBeenNthCalledWith(
      3,
      "/v1/shipping/ghn/wards?districtId=1461"
    );
  });

  it("posts quote and shipment management requests", async () => {
    mockApiPost.mockResolvedValue({ id: "shipment-1" } as never);
    mockApiPatch.mockResolvedValue({ id: "shipment-1" } as never);

    await createShippingQuote({
      deliveryMethod: "GHN_DELIVERY",
      paymentMethod: "COD",
      address: {
        fullName: "Nguyen Van A",
        phoneNumber: "0901234567",
        addressLine: "237/65 Pham Van Chieu",
        provinceId: 202,
        provinceName: "Ho Chi Minh",
        districtId: 1461,
        districtName: "Go Vap",
        wardCode: "21310",
        wardName: "Ward 14",
      },
      selectedServiceId: 53320,
    });
    await createShipmentForOrder("order-1");
    await requoteShipmentForOrder("order-1");
    await syncShipmentForOrder("order-1");
    await cancelShipmentForOrder("order-1");
    await updateShipmentNoteForOrder("order-1", "Updated admin note");

    expect(mockApiPost).toHaveBeenNthCalledWith(1, "/v1/shipping/quotes", expect.any(Object));
    expect(mockApiPost).toHaveBeenNthCalledWith(2, "/v1/shipping/orders/order-1/create", {});
    expect(mockApiPost).toHaveBeenNthCalledWith(3, "/v1/shipping/orders/order-1/requote", {});
    expect(mockApiPost).toHaveBeenNthCalledWith(4, "/v1/shipping/orders/order-1/sync", {});
    expect(mockApiPost).toHaveBeenNthCalledWith(5, "/v1/shipping/orders/order-1/cancel", {});
    expect(mockApiPatch).toHaveBeenCalledWith("/v1/shipping/orders/order-1/note", {
      note: "Updated admin note",
    });
  });

  it("returns null when shipment summary does not exist", async () => {
    mockApiGet.mockRejectedValueOnce(new Error("API 404: Not Found"));

    await expect(getShipmentSummary("order-404")).resolves.toBeNull();
  });
});
