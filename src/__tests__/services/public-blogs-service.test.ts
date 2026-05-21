import type {
  ApiBlogCategory,
  ApiBlogPostDetail,
  ApiBlogPostSummary,
  ApiPagination,
} from "@/types/api";

const apiGetMock = jest.fn();

jest.mock("@/lib/api", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPost: jest.fn(),
  apiPut: jest.fn(),
  apiPatch: jest.fn(),
  apiDelete: jest.fn(),
}));

beforeEach(() => {
  jest.resetModules();
  apiGetMock.mockReset();
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

const mockSummary: ApiBlogPostSummary = {
  id: "post-1",
  title: "Pour over basics",
  slug: "pour-over-basics",
  excerpt: "A quick brew primer",
  coverImageUrl: null,
  status: "Published",
  isFeatured: true,
  displayOrder: 0,
  publishedAt: "2026-05-02T10:00:00Z",
  createdAt: "2026-05-01T10:00:00Z",
  updatedAt: "2026-05-02T10:00:00Z",
  categories: [mockCategory],
};

const mockDetail: ApiBlogPostDetail = {
  ...mockSummary,
  contentHtml: "<p>hello</p>",
  contentJson: "{\"type\":\"doc\"}",
  coverImageFileName: null,
  seoTitle: "SEO title",
  seoDescription: "SEO description",
};

describe("public-blogs-service", () => {
  it("loads public posts with category and search filters", async () => {
    const response: ApiPagination<ApiBlogPostSummary> = {
      items: [mockSummary],
      metadata: {
        currentPage: 1,
        totalPages: 1,
        pageSize: 12,
        totalCount: 1,
        payloadSize: 1,
        hasPrevious: false,
        hasNext: false,
        takeAll: false,
      },
    };
    apiGetMock.mockResolvedValue(response);

    const { getPublicBlogPosts } = await import("@/features/blogs/api");
    const result = await getPublicBlogPosts({
      page: 1,
      size: 12,
      categorySlug: "brewing-guide",
      search: "pour",
      featuredOnly: true,
    });

    expect(result).toEqual(response);
    expect(apiGetMock).toHaveBeenCalledWith(
      "/v1/blog-posts?page=1&size=12&categorySlug=brewing-guide&featuredOnly=true&search=pour"
    );
  });

  it("loads a public post by slug", async () => {
    apiGetMock.mockResolvedValue(mockDetail);

    const { getPublicBlogPostBySlug } = await import("@/features/blogs/api");
    const result = await getPublicBlogPostBySlug("pour-over-basics");

    expect(result).toEqual(mockDetail);
    expect(apiGetMock).toHaveBeenCalledWith("/v1/blog-posts/pour-over-basics");
  });

  it("unwraps public categories from the pagination envelope", async () => {
    apiGetMock.mockResolvedValue({
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
    });

    const { getPublicBlogCategories } = await import("@/features/blogs/api");
    const result = await getPublicBlogCategories();

    expect(result).toEqual([mockCategory]);
    expect(apiGetMock).toHaveBeenCalledWith("/v1/blog-categories?takeAll=true&activeOnly=true");
  });

  it("loads featured posts from the dedicated endpoint", async () => {
    apiGetMock.mockResolvedValue([mockSummary]);

    const { getFeaturedBlogPosts } = await import("@/features/blogs/api");
    const result = await getFeaturedBlogPosts(3);

    expect(result).toEqual([mockSummary]);
    expect(apiGetMock).toHaveBeenCalledWith("/v1/blog-posts/featured?take=3");
  });
});
