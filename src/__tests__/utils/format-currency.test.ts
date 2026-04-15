import { formatVND, parseVND, formatCompactVND } from "@/utils/format-currency";

describe("formatVND", () => {
  it("formats zero", () => {
    const result = formatVND(0);
    expect(result).toContain("0");
    expect(result).toContain("₫");
  });

  it("formats a typical price", () => {
    const result = formatVND(100000);
    expect(result).toContain("100");
    expect(result).toContain("₫");
  });

  it("formats a large price with separators", () => {
    const result = formatVND(1234567);
    expect(result).toContain("1");
    expect(result).toContain("₫");
    // Locale uses dots as thousand separators in vi-VN
    expect(result.replace(/\s/g, "")).toContain("234");
  });

  it("formats negative value", () => {
    const result = formatVND(-5000);
    expect(result).toContain("5.000");
    expect(result).toContain("₫");
  });
});

describe("parseVND", () => {
  it("parses a formatted VND string back to a number", () => {
    expect(parseVND("100.000 ₫")).toBe(100000);
  });

  it("parses a plain number string", () => {
    expect(parseVND("50000")).toBe(50000);
  });

  it("returns 0 for empty string", () => {
    expect(parseVND("")).toBe(0);
  });

  it("strips all non-digit characters", () => {
    expect(parseVND("1.234.567 ₫")).toBe(1234567);
  });
});

describe("formatCompactVND", () => {
  it("uses formatVND for values below 1000", () => {
    const result = formatCompactVND(999);
    expect(result).toContain("₫");
  });

  it("formats thousands with K suffix", () => {
    expect(formatCompactVND(45000)).toBe("45.0K ₫");
  });

  it("formats millions with M suffix", () => {
    expect(formatCompactVND(1200000)).toBe("1.2M ₫");
  });

  it("formats exactly 1 million", () => {
    expect(formatCompactVND(1000000)).toBe("1.0M ₫");
  });

  it("formats exactly 1000", () => {
    expect(formatCompactVND(1000)).toBe("1.0K ₫");
  });

  it("formats a large million value", () => {
    expect(formatCompactVND(5500000)).toBe("5.5M ₫");
  });
});
