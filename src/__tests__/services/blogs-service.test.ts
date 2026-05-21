import type {
  ApiBlogPostDetail,
  ApiBlogPostSummary,
  ApiPagination,
} from "@/types/api";

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

const mockPostSummary: ApiBlogPostSummary = {
  id: "post-1",
  title: "Pour over basics",
  slug: "pour-over-basics",
  excerpt: "A quick brew primer",
  coverImageUrl: "/blog/pour-over.jpg",
  status: "Draft",
  isFeatured: false,
  displayOrder: 2,
  publishedAt: null,
  createdAt: "2026-05-01T10:00:00Z",
  updatedAt: "2026-05-02T10:00:00Z",
  categories: [
    {
      id: "cat-1",
      name: "Brewing Guide",
      slug: "brewing-guide",
      description: "How-to guides",
      displayOrder: 0,
      isActive: true,
      createdAt: "2026-05-01T10:00:00Z",
      updatedAt: "2026-05-01T10:00:00Z",
    },
  ],
};

const mockPostDetail: ApiBlogPostDetail = {
  ...mockPostSummary,
  contentHtml: "<p>Hello coffee</p>",
  contentJson: '{"type":"doc"}',
  coverImageFileName: null,
  seoTitle: "SEO title",
  seoDescription: "SEO description",
};

describe("blogs-service", () => {
  it("builds the admin list query from filters", async () => {
    const response: ApiPagination<ApiBlogPostSummary> = {
      items: [mockPostSummary],
      metadata: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 20,
        totalCount: 1,
        payloadSize: 1,
        hasPrevious: false,
        hasNext: false,
        takeAll: false,
      },
    };
    apiGetMock.mockResolvedValue(response);

    const { getAdminBlogPosts } = await import("@/features/blogs/api");
    const result = await getAdminBlogPosts({
      page: 1,
      size: 20,
      status: "Published",
      categoryId: "cat-1",
      search: "pour",
    });

    expect(result).toEqual(response);
    expect(apiGetMock).toHaveBeenCalledWith(
      "/v1/admin/blog-posts?page=1&size=20&status=Published&categoryId=cat-1&search=pour"
    );
  });

  it("creates a blog post through the admin endpoint", async () => {
    apiPostMock.mockResolvedValue(mockPostDetail);

    const { createBlogPost } = await import("@/features/blogs/api");
    const payload = {
      title: "Pour over basics",
      slug: "pour-over-basics",
      excerpt: "A quick brew primer",
      contentHtml: "<p>Hello coffee</p>",
      contentJson: '{"type":"doc"}',
      coverImageUrl: null,
      coverImageFileName: null,
      categoryIds: ["cat-1"],
      seoTitle: null,
      seoDescription: null,
      isFeatured: false,
      displayOrder: 0,
      status: "Draft" as const,
    };

    const result = await createBlogPost(payload);

    expect(result).toEqual(mockPostDetail);
    expect(apiPostMock).toHaveBeenCalledWith("/v1/admin/blog-posts", payload);
  });

  it("updates a blog post through the admin endpoint", async () => {
    apiPutMock.mockResolvedValue(mockPostDetail);

    const { updateBlogPost } = await import("@/features/blogs/api");
    const payload = {
      title: "Updated",
      slug: "updated",
      excerpt: null,
      contentHtml: "<p>Updated</p>",
      contentJson: '{"type":"doc"}',
      coverImageUrl: null,
      coverImageFileName: null,
      categoryIds: ["cat-1"],
      seoTitle: null,
      seoDescription: null,
      isFeatured: true,
      displayOrder: 1,
      status: "Published" as const,
    };

    await updateBlogPost("post-1", payload);

    expect(apiPutMock).toHaveBeenCalledWith("/v1/admin/blog-posts/post-1", payload);
  });

  it("patches status changes and reorder requests", async () => {
    apiPatchMock.mockResolvedValueOnce(mockPostDetail).mockResolvedValueOnce(undefined);

    const { reorderBlogPosts, updateBlogPostStatus } = await import("@/features/blogs/api");

    await updateBlogPostStatus("post-1", { status: "Archived" });
    await reorderBlogPosts({
      items: [
        { id: "post-1", displayOrder: 0 },
        { id: "post-2", displayOrder: 1 },
      ],
    });

    expect(apiPatchMock).toHaveBeenNthCalledWith(
      1,
      "/v1/admin/blog-posts/post-1/status",
      { status: "Archived" }
    );
    expect(apiPatchMock).toHaveBeenNthCalledWith(2, "/v1/admin/blog-posts/reorder", {
      items: [
        { id: "post-1", displayOrder: 0 },
        { id: "post-2", displayOrder: 1 },
      ],
    });
  });

  it("deletes a post through the admin endpoint", async () => {
    apiDeleteMock.mockResolvedValue(undefined);

    const { deleteBlogPost } = await import("@/features/blogs/api");
    await deleteBlogPost("post-1");

    expect(apiDeleteMock).toHaveBeenCalledWith("/v1/admin/blog-posts/post-1");
  });
});
