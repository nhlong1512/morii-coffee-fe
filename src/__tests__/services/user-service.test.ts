import type { ApiDeliveryProfile } from "@/types/api";

const apiGetMock = jest.fn();
const apiPutMock = jest.fn();

jest.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPut: (...args: unknown[]) => apiPutMock(...args),
}));

beforeEach(() => {
  jest.resetModules();
  apiGetMock.mockReset();
  apiPutMock.mockReset();
});

describe("user-service delivery profile", () => {
  it("loads the current user's structured delivery profile", async () => {
    const response: ApiDeliveryProfile = {
      fullName: "Nguyen Van A",
      phoneNumber: "0901234567",
      address: "237/65 Pham Van Chieu",
      provinceId: 202,
      provinceName: "Ho Chi Minh",
      districtId: 1461,
      districtName: "Go Vap",
      wardCode: "21310",
      wardName: "Ward 14",
    };
    apiGetMock.mockResolvedValue(response);

    const { getDeliveryProfile } = await import("@/services/user-service");
    const result = await getDeliveryProfile();

    expect(apiGetMock).toHaveBeenCalledWith("/v1/users/me/delivery-profile");
    expect(result).toEqual(response);
  });

  it("returns null when the delivery profile is missing", async () => {
    apiGetMock.mockRejectedValue(new Error("API 404: Not Found"));

    const { getDeliveryProfile } = await import("@/services/user-service");
    await expect(getDeliveryProfile()).resolves.toBeNull();
  });

  it("saves the structured delivery profile", async () => {
    const payload: ApiDeliveryProfile = {
      fullName: "Nguyen Van A",
      phoneNumber: "0901234567",
      address: "237/65 Pham Van Chieu",
      provinceId: 202,
      provinceName: "Ho Chi Minh",
      districtId: 1461,
      districtName: "Go Vap",
      wardCode: "21310",
      wardName: "Ward 14",
    };
    apiPutMock.mockResolvedValue(payload);

    const { saveDeliveryProfile } = await import("@/services/user-service");
    const result = await saveDeliveryProfile(payload);

    expect(apiPutMock).toHaveBeenCalledWith("/v1/users/me/delivery-profile", payload);
    expect(result).toEqual(payload);
  });
});
