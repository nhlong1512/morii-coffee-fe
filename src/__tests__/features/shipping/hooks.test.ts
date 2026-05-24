import { act, renderHook, waitFor } from "@testing-library/react";
import {
  useShipmentActions,
  useShipmentSummary,
  useShippingQuote,
  useShippingSelectors,
} from "@/features/shipping/hooks";
import * as shippingApi from "@/features/shipping/api";

jest.mock("@/features/shipping/api");

const mockGetShippingProvinces = shippingApi.getShippingProvinces as jest.MockedFunction<
  typeof shippingApi.getShippingProvinces
>;
const mockGetShippingDistricts = shippingApi.getShippingDistricts as jest.MockedFunction<
  typeof shippingApi.getShippingDistricts
>;
const mockGetShippingWards = shippingApi.getShippingWards as jest.MockedFunction<
  typeof shippingApi.getShippingWards
>;
const mockCreateShippingQuote = shippingApi.createShippingQuote as jest.MockedFunction<
  typeof shippingApi.createShippingQuote
>;
const mockGetShipmentSummary = shippingApi.getShipmentSummary as jest.MockedFunction<
  typeof shippingApi.getShipmentSummary
>;
const mockCreateShipmentForOrder = shippingApi.createShipmentForOrder as jest.MockedFunction<
  typeof shippingApi.createShipmentForOrder
>;

describe("shipping hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetShippingProvinces.mockResolvedValue([
      { provinceId: 202, provinceName: "Ho Chi Minh", code: null, isActive: true },
    ] as never);
    mockGetShippingDistricts.mockResolvedValue([
      {
        districtId: 1461,
        provinceId: 202,
        districtName: "Go Vap",
        supportType: 3,
        isActive: true,
      },
    ] as never);
    mockGetShippingWards.mockResolvedValue([
      { wardCode: "21310", districtId: 1461, wardName: "Ward 14", isActive: true },
    ] as never);
    mockCreateShippingQuote.mockResolvedValue({
      provider: "GHN",
      environment: "sandbox",
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
      packageMetrics: {
        totalWeightGrams: 250,
        lengthCm: 20,
        widthCm: 20,
        heightCm: 8,
        insuranceValue: 49000,
        itemCount: 1,
      },
      service: {
        serviceId: 53320,
        serviceTypeId: 2,
        shortName: "Hang nhe",
        displayName: "GHN Hang nhe",
        estimatedLeadTime: "2026-05-25T16:59:59Z",
        fee: 20900,
        isRecommended: true,
      },
      availableServices: [],
      feeBreakdown: {
        totalFee: 20900,
        serviceFee: 20900,
        insuranceFee: 0,
        stationFee: 0,
        pickStationFee: 0,
        couponValue: 0,
        r2SFee: 0,
        returnAgainFee: 0,
        documentReturnFee: 0,
        doubleCheckFee: 0,
        codFee: 0,
        rawPayload: "{...}",
      },
      estimatedDeliveryAt: "2026-05-25T16:59:59Z",
      quoteExpiresAt: "2026-05-24T14:00:00Z",
      quoteFingerprint: "quote-1",
    } as never);
    mockGetShipmentSummary.mockResolvedValue({
      id: "shipment-1",
      provider: "GHN",
      providerEnvironment: "sandbox",
      status: "DELIVERING",
      statusLabel: "delivering",
      clientOrderCode: "MORII-1",
      providerOrderCode: "LXVNAU",
      shopId: 200400,
      serviceId: 53320,
      serviceTypeId: 2,
      feeTotal: 20900,
      expectedDeliveryAt: null,
      trackingUrl: null,
      failureReasonCode: null,
      failureReason: null,
      note: "call first",
      lastSyncedAt: null,
    } as never);
    mockCreateShipmentForOrder.mockResolvedValue({
      id: "shipment-1",
      provider: "GHN",
      providerEnvironment: "sandbox",
      status: "CREATED",
      statusLabel: "created",
      clientOrderCode: "MORII-1",
      providerOrderCode: "LXVNAU",
      shopId: 200400,
      serviceId: 53320,
      serviceTypeId: 2,
      feeTotal: 20900,
      expectedDeliveryAt: null,
      trackingUrl: null,
      failureReasonCode: null,
      failureReason: null,
      note: "call first",
      lastSyncedAt: null,
    } as never);
  });

  it("loads province, district, and ward selectors", async () => {
    const { result } = renderHook(() => useShippingSelectors(202, 1461));

    await waitFor(() => expect(result.current.loadingProvinces).toBe(false));
    await waitFor(() => expect(result.current.loadingDistricts).toBe(false));
    await waitFor(() => expect(result.current.loadingWards).toBe(false));

    expect(result.current.provinces).toHaveLength(1);
    expect(result.current.districts[0]?.districtName).toBe("Go Vap");
    expect(result.current.wards[0]?.wardName).toBe("Ward 14");
  });

  it("requests, invalidates, and resets quotes", async () => {
    const { result } = renderHook(() => useShippingQuote());

    await act(async () => {
      await result.current.requestQuote({
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
      });
    });

    expect(result.current.quote?.quoteFingerprint).toBe("quote-1");

    act(() => {
      result.current.invalidateQuote();
    });
    expect(result.current.quoteInvalidated).toBe(true);

    act(() => {
      result.current.resetQuote();
    });
    expect(result.current.quote).toBeNull();
  });

  it("loads shipment summaries and runs shipment actions", async () => {
    const { result: summaryResult } = renderHook(() => useShipmentSummary("order-1"));
    await waitFor(() => expect(summaryResult.current.loading).toBe(false));
    expect(summaryResult.current.shipment?.status).toBe("DELIVERING");

    const { result: actionResult } = renderHook(() => useShipmentActions("order-1"));
    await act(async () => {
      await actionResult.current.runAction("create");
    });

    expect(mockCreateShipmentForOrder).toHaveBeenCalledWith("order-1");
    expect(actionResult.current.actionMessage).toBeTruthy();
  });
});
