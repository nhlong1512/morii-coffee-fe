import type { ApiBlogCategory, ApiPagination } from "@/types/api";

const apiGetMock = jest.fn();
const apiPostMock = jest.fn();
const apiPutMock = jest.fn();
const apiPatchMock = jest.fn();
const apiDeleteMock = jest.fn();

jest.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPost: (...args: unknown[]) => apiPostMock(...args),
  apiPut: (...args: unknown[]) => apiPutMock(...args),
  apiPatch: (...args: unknown[]) => apiPatchMock(...args),
  apiDelete: (...args: unknown[]) => apiDeleteMock(...args),
}));

beforeEach(() => {
  jest.resetModules();
  apiGetMock.mockReset();
  apiPostMock.mockReset();
  apiPutMock.mockReset();
  apiPatchMock.mockReset();
  apiDeleteMock.mockReset();
});

const mockCategory: ApiBlogCategory = {
  id: "cat-1",
  name: "Brewing Guide",
  slug: "brewing-guide",
  description: "How-to guides",
  displayOrder: 0,
  isActive: true,
  createdAt: "2026-05-01T10:00:00Z",
  updatedAt: "2026-05-01T10:00:00Z",
};

describe("blog-categories-service", () => {
  it("loads all admin blog categories with takeAll=true", async () => {
    const response: ApiPagination<ApiBlogCategory> = {
      items: [mockCategory],
      metadata: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 20,
        totalCount: 1,
        payloadSize: 1,
        hasPrevious: false,
        hasNext: false,
        takeAll: true,
      },
    };
    apiGetMock.mockResolvedValue(response);

    const { getAdminBlogCategories } = await import("@/features/blogs/api");
    const result = await getAdminBlogCategories();

    expect(result).toEqual(response);
    expect(apiGetMock).toHaveBeenCalledWith("/v1/admin/blog-categories?takeAll=true");
  });

  it("creates and updates a category", async () => {
    apiPostMock.mockResolvedValue(mockCategory);
    apiPutMock.mockResolvedValue(mockCategory);

    const { createBlogCategory, updateBlogCategory } = await import("@/features/blogs/api");
    const payload = {
      name: "Brewing Guide",
      slug: "brewing-guide",
      description: "How-to guides",
      displayOrder: 0,
      isActive: true,
    };

    await createBlogCategory(payload);
    await updateBlogCategory("cat-1", payload);

    expect(apiPostMock).toHaveBeenCalledWith("/v1/admin/blog-categories", payload);
    expect(apiPutMock).toHaveBeenCalledWith("/v1/admin/blog-categories/cat-1", payload);
  });

  it("deletes and reorders categories", async () => {
    apiDeleteMock.mockResolvedValue(undefined);
    apiPatchMock.mockResolvedValue(undefined);

    const { deleteBlogCategory, reorderBlogCategories } = await import("@/features/blogs/api");
    await deleteBlogCategory("cat-1");
    await reorderBlogCategories({
      items: [
        { id: "cat-1", displayOrder: 0 },
        { id: "cat-2", displayOrder: 1 },
      ],
    });

    expect(apiDeleteMock).toHaveBeenCalledWith("/v1/admin/blog-categories/cat-1");
    expect(apiPatchMock).toHaveBeenCalledWith("/v1/admin/blog-categories/reorder", {
      items: [
        { id: "cat-1", displayOrder: 0 },
        { id: "cat-2", displayOrder: 1 },
      ],
    });
  });
});
