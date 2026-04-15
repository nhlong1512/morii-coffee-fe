import { generateSlug, toggleArrayItem, toggleSetItem, ALL_SIZES } from "@/utils/products";
import { ProductSize } from "@/enums";

describe("ALL_SIZES", () => {
  it("contains Small, Medium, Large in order", () => {
    expect(ALL_SIZES).toEqual([ProductSize.Small, ProductSize.Medium, ProductSize.Large]);
  });

  it("has exactly 3 elements", () => {
    expect(ALL_SIZES).toHaveLength(3);
  });
});

describe("generateSlug", () => {
  it("lowercases the input", () => {
    expect(generateSlug("HELLO")).toBe("hello");
  });

  it("replaces spaces with hyphens", () => {
    expect(generateSlug("hello world")).toBe("hello-world");
  });

  it("strips special characters", () => {
    expect(generateSlug("café & more!")).toBe("caf-more");
  });

  it("trims leading and trailing whitespace", () => {
    expect(generateSlug("  hello  ")).toBe("hello");
  });

  it("collapses multiple hyphens into one", () => {
    expect(generateSlug("hello---world")).toBe("hello-world");
  });

  it("collapses multiple spaces into single hyphen", () => {
    expect(generateSlug("hello   world")).toBe("hello-world");
  });

  it("handles a typical product name", () => {
    expect(generateSlug("Caramel Macchiato")).toBe("caramel-macchiato");
  });

  it("handles already-slugified input", () => {
    expect(generateSlug("cold-brew")).toBe("cold-brew");
  });

  it("returns empty string for empty input", () => {
    expect(generateSlug("")).toBe("");
  });
});

describe("toggleArrayItem", () => {
  it("adds an item not in the array", () => {
    expect(toggleArrayItem([1, 2], 3)).toEqual([1, 2, 3]);
  });

  it("removes an item that is already in the array", () => {
    expect(toggleArrayItem([1, 2, 3], 2)).toEqual([1, 3]);
  });

  it("returns a new array (does not mutate input)", () => {
    const original = [1, 2, 3];
    const result = toggleArrayItem(original, 2);
    expect(result).not.toBe(original);
  });

  it("works with strings", () => {
    expect(toggleArrayItem(["a", "b"], "c")).toEqual(["a", "b", "c"]);
    expect(toggleArrayItem(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });

  it("handles toggling on empty array", () => {
    expect(toggleArrayItem([], "x")).toEqual(["x"]);
  });
});

describe("toggleSetItem", () => {
  it("adds a string not in the set", () => {
    const set = new Set(["a", "b"]);
    const result = toggleSetItem(set, "c");
    expect(result.has("c")).toBe(true);
    expect(result.size).toBe(3);
  });

  it("removes a string that is already in the set", () => {
    const set = new Set(["a", "b", "c"]);
    const result = toggleSetItem(set, "b");
    expect(result.has("b")).toBe(false);
    expect(result.size).toBe(2);
  });

  it("returns a new Set (immutability)", () => {
    const set = new Set(["a"]);
    const result = toggleSetItem(set, "b");
    expect(result).not.toBe(set);
  });

  it("original set is not mutated", () => {
    const set = new Set(["a", "b"]);
    toggleSetItem(set, "a");
    expect(set.has("a")).toBe(true); // original unchanged
  });

  it("handles empty set", () => {
    const result = toggleSetItem(new Set<string>(), "x");
    expect(result.has("x")).toBe(true);
    expect(result.size).toBe(1);
  });
});
