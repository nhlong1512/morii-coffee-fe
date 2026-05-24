jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

import {
  AddressSelects,
  DeliveryMethodSelector,
  ShipmentSummaryCard,
  ShippingQuoteCard,
  createEmptyShippingAddress,
  getDeliveryMethodLabelKey,
} from "@/features/shipping";

describe("shipping feature exports", () => {
  it("re-exports the main shipping surface", () => {
    expect(AddressSelects).toBeDefined();
    expect(DeliveryMethodSelector).toBeDefined();
    expect(ShipmentSummaryCard).toBeDefined();
    expect(ShippingQuoteCard).toBeDefined();
    expect(createEmptyShippingAddress().provinceId).toBeNull();
    expect(getDeliveryMethodLabelKey("GHN_DELIVERY")).toBe("ghnDelivery");
  });
});
