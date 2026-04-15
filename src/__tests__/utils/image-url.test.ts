import {
  getProductImageUrl,
  getAvatarImageUrl,
  getBannerImageUrl,
  buildCdnUrl,
  isExternalUrl,
  getOptimizedImageUrl,
} from "@/utils/image-url";

describe("getProductImageUrl", () => {
  it("returns the provided URL when valid", () => {
    expect(getProductImageUrl("/images/product.jpg")).toBe("/images/product.jpg");
  });

  it("returns default placeholder for null", () => {
    expect(getProductImageUrl(null)).toBe("/images/placeholder-product.png");
  });

  it("returns default placeholder for undefined", () => {
    expect(getProductImageUrl(undefined)).toBe("/images/placeholder-product.png");
  });

  it("returns default placeholder for empty string", () => {
    expect(getProductImageUrl("")).toBe("/images/placeholder-product.png");
  });

  it("returns default placeholder for whitespace-only string", () => {
    expect(getProductImageUrl("   ")).toBe("/images/placeholder-product.png");
  });
});

describe("getAvatarImageUrl", () => {
  it("returns the provided URL when valid", () => {
    expect(getAvatarImageUrl("https://cdn.example.com/avatar.jpg")).toBe(
      "https://cdn.example.com/avatar.jpg"
    );
  });

  it("returns default avatar for null", () => {
    expect(getAvatarImageUrl(null)).toBe("/images/placeholder-avatar.png");
  });

  it("returns default avatar for empty string", () => {
    expect(getAvatarImageUrl("")).toBe("/images/placeholder-avatar.png");
  });
});

describe("getBannerImageUrl", () => {
  it("returns the provided URL when valid", () => {
    expect(getBannerImageUrl("/images/banner.jpg")).toBe("/images/banner.jpg");
  });

  it("returns default banner for null", () => {
    expect(getBannerImageUrl(null)).toBe("/images/placeholder-banner.png");
  });

  it("returns default banner for undefined", () => {
    expect(getBannerImageUrl(undefined)).toBe("/images/placeholder-banner.png");
  });
});

describe("buildCdnUrl", () => {
  const originalEnv = process.env.NEXT_PUBLIC_CDN_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CDN_URL = originalEnv;
  });

  it("returns path unchanged when no CDN base URL is set", () => {
    delete process.env.NEXT_PUBLIC_CDN_URL;
    expect(buildCdnUrl("/images/photo.jpg")).toBe("/images/photo.jpg");
  });

  it("prepends CDN base when set", () => {
    process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example.com";
    expect(buildCdnUrl("/images/photo.jpg")).toBe("https://cdn.example.com/images/photo.jpg");
  });

  it("appends width query param when provided", () => {
    process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example.com";
    const result = buildCdnUrl("/img.jpg", { width: 800 });
    expect(result).toContain("w=800");
  });

  it("appends multiple options as query params", () => {
    process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example.com";
    const result = buildCdnUrl("/img.jpg", { width: 800, quality: 85, format: "webp" });
    expect(result).toContain("w=800");
    expect(result).toContain("q=85");
    expect(result).toContain("f=webp");
  });

  it("does not add query string when options are empty", () => {
    process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example.com";
    const result = buildCdnUrl("/img.jpg", {});
    expect(result).toBe("https://cdn.example.com/img.jpg");
  });
});

describe("isExternalUrl", () => {
  it("returns true for https URL", () => {
    expect(isExternalUrl("https://example.com/image.jpg")).toBe(true);
  });

  it("returns true for http URL", () => {
    expect(isExternalUrl("http://example.com/image.jpg")).toBe(true);
  });

  it("returns false for relative path", () => {
    expect(isExternalUrl("/images/photo.jpg")).toBe(false);
  });

  it("returns false for relative path without leading slash", () => {
    expect(isExternalUrl("images/photo.jpg")).toBe(false);
  });
});

describe("getOptimizedImageUrl", () => {
  const originalEnv = process.env.NEXT_PUBLIC_CDN_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_CDN_URL = originalEnv;
  });

  it("returns path unchanged with no CDN configured", () => {
    delete process.env.NEXT_PUBLIC_CDN_URL;
    expect(getOptimizedImageUrl("/img.jpg", "md")).toBe("/img.jpg");
  });

  it("uses sm size (400px, q75)", () => {
    process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example.com";
    const result = getOptimizedImageUrl("/img.jpg", "sm");
    expect(result).toContain("w=400");
    expect(result).toContain("q=75");
    expect(result).toContain("f=webp");
  });

  it("uses md size (800px, q80) by default", () => {
    process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example.com";
    const result = getOptimizedImageUrl("/img.jpg");
    expect(result).toContain("w=800");
    expect(result).toContain("q=80");
  });

  it("uses lg size (1200px, q85)", () => {
    process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example.com";
    const result = getOptimizedImageUrl("/img.jpg", "lg");
    expect(result).toContain("w=1200");
    expect(result).toContain("q=85");
  });

  it("uses xl size (1920px, q90)", () => {
    process.env.NEXT_PUBLIC_CDN_URL = "https://cdn.example.com";
    const result = getOptimizedImageUrl("/img.jpg", "xl");
    expect(result).toContain("w=1920");
    expect(result).toContain("q=90");
  });
});
