const cookiesMock = jest.fn();

jest.mock("next-intl/server", () => ({
  getRequestConfig: (factory: () => unknown) => factory,
}));

jest.mock("next/headers", () => ({
  cookies: () => cookiesMock(),
}));

describe("i18n request configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses Vietnamese when the browser has no locale cookie", async () => {
    cookiesMock.mockResolvedValue({
      get: jest.fn().mockReturnValue(undefined),
    });
    const { DEFAULT_LOCALE, default: getConfig } = await import("@/i18n/request");

    await expect(getConfig()).resolves.toEqual(
      expect.objectContaining({
        locale: DEFAULT_LOCALE,
      })
    );
    expect(DEFAULT_LOCALE).toBe("vi");
  });

  it("preserves the locale selected by the user", async () => {
    cookiesMock.mockResolvedValue({
      get: jest.fn().mockReturnValue({ value: "en" }),
    });
    const { default: getConfig } = await import("@/i18n/request");

    await expect(getConfig()).resolves.toEqual(
      expect.objectContaining({
        locale: "en",
      })
    );
  });
});
