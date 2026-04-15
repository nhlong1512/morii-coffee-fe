import { buildCategoryFormData } from "@/helpers/categories";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@/interfaces/categories";

describe("buildCategoryFormData — CreateCategoryRequest", () => {
  it("appends required Name field", () => {
    const fd = buildCategoryFormData({ name: "Espresso" });
    expect(fd.get("Name")).toBe("Espresso");
  });

  it("appends Description when provided", () => {
    const fd = buildCategoryFormData({ name: "Espresso", description: "Strong coffee" });
    expect(fd.get("Description")).toBe("Strong coffee");
  });

  it("does not append Description when undefined", () => {
    const fd = buildCategoryFormData({ name: "Espresso" });
    expect(fd.get("Description")).toBeNull();
  });

  it("appends DisplayOrder as string when provided", () => {
    const fd = buildCategoryFormData({ name: "Espresso", displayOrder: 2 });
    expect(fd.get("DisplayOrder")).toBe("2");
  });

  it("does not append DisplayOrder when undefined", () => {
    const fd = buildCategoryFormData({ name: "Espresso" });
    expect(fd.get("DisplayOrder")).toBeNull();
  });

  it("appends Icon File when provided", () => {
    const file = new File(["data"], "icon.png", { type: "image/png" });
    const fd = buildCategoryFormData({ name: "Espresso", icon: file });
    expect(fd.get("Icon")).toBe(file);
  });

  it("does not append Icon when not provided", () => {
    const fd = buildCategoryFormData({ name: "Espresso" });
    expect(fd.get("Icon")).toBeNull();
  });

  it("does not append IsActive for CreateCategoryRequest (no isActive field)", () => {
    const req: CreateCategoryRequest = { name: "Espresso" };
    const fd = buildCategoryFormData(req);
    expect(fd.get("IsActive")).toBeNull();
  });
});

describe("buildCategoryFormData — UpdateCategoryRequest", () => {
  it("appends IsActive=true as string", () => {
    const req: UpdateCategoryRequest = { name: "Espresso", isActive: true };
    const fd = buildCategoryFormData(req);
    expect(fd.get("IsActive")).toBe("true");
  });

  it("appends IsActive=false as string", () => {
    const req: UpdateCategoryRequest = { name: "Espresso", isActive: false };
    const fd = buildCategoryFormData(req);
    expect(fd.get("IsActive")).toBe("false");
  });

  it("does not append IsActive when undefined", () => {
    const req: UpdateCategoryRequest = { name: "Espresso" };
    const fd = buildCategoryFormData(req);
    expect(fd.get("IsActive")).toBeNull();
  });
});
