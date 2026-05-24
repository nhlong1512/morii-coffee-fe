import {
  buildCartShippingFingerprint,
  buildShippingQuoteRequest,
  buildShippingQuoteSnapshot,
  getDeliveryMethodLabelKey,
  getShipmentStatusTone,
  hasStructuredDeliveryAddress,
  isQuoteExpired,
  isShipmentCancellable,
  shouldInvalidateQuote,
} from "@/features/shipping/utils";

describe("shipping utils", () => {
  const delivery = {
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

  it("builds a quote request from the structured address", () => {
    expect(
      buildShippingQuoteRequest({
        deliveryMethod: "GHN_DELIVERY",
        paymentMethod: "COD",
        delivery,
        selectedServiceId: 53320,
      })
    ).toEqual({
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
  });

  it("derives quote snapshots and detects stale quotes", () => {
    const quote = {
      provider: "GHN" as const,
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
      quoteExpiresAt: "2999-05-24T14:00:00Z",
      quoteFingerprint: "quote-1",
    };

    expect(buildShippingQuoteSnapshot(quote)).toEqual({
      shippingQuoteFingerprint: "quote-1",
      shippingServiceId: 53320,
      shippingServiceTypeId: 2,
      shippingServiceLabel: "GHN Hang nhe",
      shippingFee: 20900,
      shippingQuoteExpiresAt: "2999-05-24T14:00:00Z",
      shippingProviderEnvironment: "sandbox",
    });
    expect(isQuoteExpired(quote)).toBe(false);
    expect(isQuoteExpired({ quoteExpiresAt: "2000-01-01T00:00:00Z" })).toBe(true);
  });

  it("tracks quote invalidation and shipment display helpers", () => {
    expect(hasStructuredDeliveryAddress(delivery)).toBe(true);
    expect(
      shouldInvalidateQuote(delivery, { ...delivery, districtId: 123, districtName: "District 1" })
    ).toBe(true);
    expect(getDeliveryMethodLabelKey("PICKUP")).toBe("pickup");
    expect(getShipmentStatusTone("FAILED_TO_CREATE").isRecoverable).toBe(true);
    expect(isShipmentCancellable("TRANSPORTING")).toBe(true);
    expect(isShipmentCancellable("DELIVERED")).toBe(false);
    expect(
      buildCartShippingFingerprint([
        { productId: "p1", quantity: 2, variantId: "v1" },
        { productId: "p2", quantity: 1, variantId: null },
      ])
    ).toContain("\"productId\":\"p1\"");
  });
});
