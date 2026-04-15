import { buildBannerFormData } from "@/helpers/banners";
import type { CreateBannerRequest } from "@/interfaces/banners";

describe("buildBannerFormData", () => {
  it("appends required Title", () => {
    const fd = buildBannerFormData({ title: "Spring Sale" });
    expect(fd.get("Title")).toBe("Spring Sale");
  });

  it("appends Subtitle when provided", () => {
    const fd = buildBannerFormData({ title: "T", subtitle: "Sub" });
    expect(fd.get("Subtitle")).toBe("Sub");
  });

  it("does not append Subtitle when undefined", () => {
    const fd = buildBannerFormData({ title: "T" });
    expect(fd.get("Subtitle")).toBeNull();
  });

  it("appends Cta when provided", () => {
    const fd = buildBannerFormData({ title: "T", cta: "Shop Now" });
    expect(fd.get("Cta")).toBe("Shop Now");
  });

  it("appends CtaLink when provided", () => {
    const fd = buildBannerFormData({ title: "T", ctaLink: "/products" });
    expect(fd.get("CtaLink")).toBe("/products");
  });

  it("appends DisplayOrder as string", () => {
    const fd = buildBannerFormData({ title: "T", displayOrder: 3 });
    expect(fd.get("DisplayOrder")).toBe("3");
  });

  it("does not append DisplayOrder when undefined", () => {
    const fd = buildBannerFormData({ title: "T" });
    expect(fd.get("DisplayOrder")).toBeNull();
  });

  it("appends StartDate when provided", () => {
    const fd = buildBannerFormData({ title: "T", startDate: "2024-01-01" });
    expect(fd.get("StartDate")).toBe("2024-01-01");
  });

  it("appends EndDate when provided", () => {
    const fd = buildBannerFormData({ title: "T", endDate: "2024-01-31" });
    expect(fd.get("EndDate")).toBe("2024-01-31");
  });

  it("appends IsActive=true as string", () => {
    const fd = buildBannerFormData({ title: "T", isActive: true });
    expect(fd.get("IsActive")).toBe("true");
  });

  it("appends IsActive=false as string", () => {
    const fd = buildBannerFormData({ title: "T", isActive: false });
    expect(fd.get("IsActive")).toBe("false");
  });

  it("does not append IsActive when undefined", () => {
    const fd = buildBannerFormData({ title: "T" });
    expect(fd.get("IsActive")).toBeNull();
  });

  it("appends Image File under correct key", () => {
    const file = new File(["data"], "banner.jpg", { type: "image/jpeg" });
    const fd = buildBannerFormData({ title: "T", image: file });
    expect(fd.get("Image")).toBe(file);
  });

  it("does not append Image when not provided", () => {
    const req: CreateBannerRequest = { title: "T" };
    const fd = buildBannerFormData(req);
    expect(fd.get("Image")).toBeNull();
  });
});
