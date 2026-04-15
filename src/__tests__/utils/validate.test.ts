import {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isRequired,
  validatePasswordMatch,
  isValidUrl,
  isInRange,
} from "@/utils/validate";

describe("isValidEmail", () => {
  it("accepts a valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("accepts email with subdomain", () => {
    expect(isValidEmail("user@mail.example.com")).toBe(true);
  });

  it("rejects email missing @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects email missing domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects email with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });

  it("rejects email without TLD", () => {
    expect(isValidEmail("user@example")).toBe(false);
  });
});

describe("validatePassword", () => {
  it("accepts a valid strong password", () => {
    expect(validatePassword("StrongPass1")).toEqual({ isValid: true });
  });

  it("rejects passwords shorter than 8 characters", () => {
    const result = validatePassword("Abc1");
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/8 characters/i);
  });

  it("rejects passwords without an uppercase letter", () => {
    const result = validatePassword("weakpass1");
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/uppercase/i);
  });

  it("rejects passwords without a lowercase letter", () => {
    const result = validatePassword("WEAKPASS1");
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/lowercase/i);
  });

  it("rejects passwords without a number", () => {
    const result = validatePassword("WeakPasswd");
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/number/i);
  });

  it("accepts exactly 8 characters that meet all rules", () => {
    expect(validatePassword("StrongP1")).toEqual({ isValid: true });
  });
});

describe("isValidPhone", () => {
  it("accepts Vietnamese 10-digit number starting with 0", () => {
    expect(isValidPhone("0912345678")).toBe(true);
  });

  it("accepts number with +84 prefix", () => {
    expect(isValidPhone("+84912345678")).toBe(true);
  });

  it("accepts number with spaces (stripped)", () => {
    expect(isValidPhone("091 234 5678")).toBe(true);
  });

  it("rejects number with wrong length", () => {
    expect(isValidPhone("091234567")).toBe(false);
  });

  it("rejects number starting with 1 (no + prefix)", () => {
    expect(isValidPhone("1234567890")).toBe(false);
  });

  it("rejects letters", () => {
    expect(isValidPhone("09123abc78")).toBe(false);
  });
});

describe("isRequired", () => {
  it("returns false for null", () => {
    expect(isRequired(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isRequired(undefined)).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isRequired("")).toBe(false);
  });

  it("returns false for whitespace-only string", () => {
    expect(isRequired("   ")).toBe(false);
  });

  it("returns true for a non-empty string", () => {
    expect(isRequired("hello")).toBe(true);
  });

  it("returns true for number 0", () => {
    expect(isRequired(0)).toBe(true);
  });

  it("returns true for positive number", () => {
    expect(isRequired(42)).toBe(true);
  });
});

describe("validatePasswordMatch", () => {
  it("returns valid when passwords match", () => {
    expect(validatePasswordMatch("pass123", "pass123")).toEqual({ isValid: true });
  });

  it("returns invalid with error when passwords differ", () => {
    const result = validatePasswordMatch("pass123", "pass456");
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/do not match/i);
  });

  it("returns invalid when one is empty", () => {
    const result = validatePasswordMatch("pass123", "");
    expect(result.isValid).toBe(false);
  });
});

describe("isValidUrl", () => {
  it("accepts https URL", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
  });

  it("accepts http URL", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
  });

  it("accepts URL with path and query", () => {
    expect(isValidUrl("https://example.com/path?q=1")).toBe(true);
  });

  it("rejects relative path", () => {
    expect(isValidUrl("/products")).toBe(false);
  });

  it("rejects garbage string", () => {
    expect(isValidUrl("not a url")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidUrl("")).toBe(false);
  });
});

describe("isInRange", () => {
  it("returns true when value is within range", () => {
    expect(isInRange(5, 1, 10)).toBe(true);
  });

  it("returns true at minimum boundary (inclusive)", () => {
    expect(isInRange(1, 1, 10)).toBe(true);
  });

  it("returns true at maximum boundary (inclusive)", () => {
    expect(isInRange(10, 1, 10)).toBe(true);
  });

  it("returns false when value is below minimum", () => {
    expect(isInRange(0, 1, 10)).toBe(false);
  });

  it("returns false when value is above maximum", () => {
    expect(isInRange(11, 1, 10)).toBe(false);
  });

  it("handles equal min and max", () => {
    expect(isInRange(5, 5, 5)).toBe(true);
    expect(isInRange(4, 5, 5)).toBe(false);
  });
});
