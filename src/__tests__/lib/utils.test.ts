import { cn, formatCategory } from "@/lib/utils";

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves Tailwind conflicts — last value wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes with falsy values", () => {
    expect(cn("foo", false && "bar", undefined, null, "baz")).toBe("foo baz");
  });

  it("handles object syntax", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("returns empty string when all inputs are falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });

  it("merges array inputs", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});

describe("formatCategory", () => {
  it("returns display name for known espresso slug", () => {
    expect(formatCategory("espresso")).toBe("Espresso");
  });

  it("returns display name for known cold-brew slug", () => {
    expect(formatCategory("cold-brew")).toBe("Cold Brew");
  });

  it("returns display name for known latte slug", () => {
    expect(formatCategory("latte")).toBe("Latte");
  });

  it("returns display name for known pastry slug", () => {
    expect(formatCategory("pastry")).toBe("Pastry");
  });

  it("returns display name for known merchandise slug", () => {
    expect(formatCategory("merchandise")).toBe("Merchandise");
  });

  it("title-cases unknown slug with hyphens", () => {
    expect(formatCategory("some-unknown-category")).toBe("Some Unknown Category");
  });

  it("title-cases single-word unknown slug", () => {
    expect(formatCategory("unknown")).toBe("Unknown");
  });

  it("title-cases slug with underscores by returning them (hyphen-replace only)", () => {
    // Underscores are not replaced — only hyphens are converted to spaces
    const result = formatCategory("custom_slug");
    expect(result).toBe("Custom_slug");
  });
});
