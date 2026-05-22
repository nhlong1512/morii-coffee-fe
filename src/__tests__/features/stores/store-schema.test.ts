import { defaultStoreFormValues, storeFormSchema } from "@/features/stores/schema";

describe("store schema", () => {
  it("accepts the default store form values when required fields are filled", () => {
    const result = storeFormSchema.safeParse({
      ...defaultStoreFormValues,
      name: "Morii D1",
      address: "42 Nguyen Hue",
      city: "Ho Chi Minh City",
      latitude: "10.77",
      longitude: "106.7",
      phone: "0900000000",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid numeric coordinates", () => {
    const result = storeFormSchema.safeParse({
      ...defaultStoreFormValues,
      name: "Morii D1",
      address: "42 Nguyen Hue",
      city: "Ho Chi Minh City",
      latitude: "abc",
      longitude: "106.7",
      phone: "0900000000",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Latitude must be a valid number");
  });

  it("rejects invalid operating windows", () => {
    const result = storeFormSchema.safeParse({
      ...defaultStoreFormValues,
      name: "Morii D1",
      address: "42 Nguyen Hue",
      city: "Ho Chi Minh City",
      latitude: "10.77",
      longitude: "106.7",
      phone: "0900000000",
      openingHours: defaultStoreFormValues.openingHours.map((hour, index) =>
        index === 0 ? { ...hour, openTime: "18:00", closeTime: "08:00" } : hour
      ),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes("Open time"))).toBe(
      true
    );
  });

  it("rejects duplicate day entries", () => {
    const duplicateHours = [
      ...defaultStoreFormValues.openingHours.slice(0, 6),
      { ...defaultStoreFormValues.openingHours[0] },
    ];

    const result = storeFormSchema.safeParse({
      ...defaultStoreFormValues,
      name: "Morii D1",
      address: "42 Nguyen Hue",
      city: "Ho Chi Minh City",
      latitude: "10.77",
      longitude: "106.7",
      phone: "0900000000",
      openingHours: duplicateHours,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.message.includes("unique days"))).toBe(
      true
    );
  });
});
