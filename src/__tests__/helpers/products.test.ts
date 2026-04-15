import { buildProductFormData } from "@/helpers/products";
import type { CreateProductRequest, UpdateProductRequest } from "@/interfaces/products";

describe("buildProductFormData — CreateProductRequest", () => {
  const baseRequest: CreateProductRequest = {
    name: "Caramel Latte",
    basePrice: 55000,
    categoryIds: ["cat-1", "cat-2"],
  };

  it("appends required Name", () => {
    const fd = buildProductFormData(baseRequest);
    expect(fd.get("Name")).toBe("Caramel Latte");
  });

  it("appends BasePrice as string", () => {
    const fd = buildProductFormData(baseRequest);
    expect(fd.get("BasePrice")).toBe("55000");
  });

  it("appends each categoryId as a separate CategoryIds entry", () => {
    const fd = buildProductFormData(baseRequest);
    expect(fd.getAll("CategoryIds")).toEqual(["cat-1", "cat-2"]);
  });

  it("appends no CategoryIds entries for empty array", () => {
    const fd = buildProductFormData({ ...baseRequest, categoryIds: [] });
    expect(fd.getAll("CategoryIds")).toHaveLength(0);
  });

  it("appends Slug when provided", () => {
    const fd = buildProductFormData({ ...baseRequest, slug: "caramel-latte" });
    expect(fd.get("Slug")).toBe("caramel-latte");
  });

  it("does not append Slug when undefined", () => {
    const fd = buildProductFormData(baseRequest);
    expect(fd.get("Slug")).toBeNull();
  });

  it("appends Description when provided", () => {
    const fd = buildProductFormData({ ...baseRequest, description: "Rich caramel flavor" });
    expect(fd.get("Description")).toBe("Rich caramel flavor");
  });

  it("appends Thumbnail File under correct key", () => {
    const file = new File(["data"], "thumb.jpg", { type: "image/jpeg" });
    const fd = buildProductFormData({ ...baseRequest, thumbnail: file });
    expect(fd.get("Thumbnail")).toBe(file);
  });

  it("does not append Thumbnail when undefined", () => {
    const fd = buildProductFormData(baseRequest);
    expect(fd.get("Thumbnail")).toBeNull();
  });

  it("appends IsFeatured as string when true", () => {
    const fd = buildProductFormData({ ...baseRequest, isFeatured: true });
    expect(fd.get("IsFeatured")).toBe("true");
  });

  it("appends IsFeatured as string when false", () => {
    const fd = buildProductFormData({ ...baseRequest, isFeatured: false });
    expect(fd.get("IsFeatured")).toBe("false");
  });

  it("does not append IsFeatured when undefined", () => {
    const fd = buildProductFormData(baseRequest);
    expect(fd.get("IsFeatured")).toBeNull();
  });

  it("appends DisplayOrder as string when provided", () => {
    const fd = buildProductFormData({ ...baseRequest, displayOrder: 5 });
    expect(fd.get("DisplayOrder")).toBe("5");
  });

  it("does not append Status for CreateProductRequest (no status field)", () => {
    const fd = buildProductFormData(baseRequest);
    expect(fd.get("Status")).toBeNull();
  });
});

describe("buildProductFormData — UpdateProductRequest", () => {
  it("appends Status when provided", () => {
    const req = {
      name: "Latte",
      basePrice: 45000,
      categoryIds: ["cat-1"],
      status: "Active",
    } as unknown as UpdateProductRequest;
    const fd = buildProductFormData(req);
    expect(fd.get("Status")).toBe("Active");
  });

  it("does not append Status when undefined", () => {
    const req = {
      name: "Latte",
      basePrice: 45000,
      categoryIds: ["cat-1"],
    } as unknown as UpdateProductRequest;
    const fd = buildProductFormData(req);
    expect(fd.get("Status")).toBeNull();
  });
});
