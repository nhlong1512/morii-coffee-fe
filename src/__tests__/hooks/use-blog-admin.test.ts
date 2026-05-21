import { renderHook, waitFor } from "@testing-library/react";
import { useAdminBlogCategories, useAdminBlogPost, useAdminBlogPosts } from "@/features/blogs/hooks";

const getAdminBlogPostsMock = jest.fn();
const getAdminBlogPostByIdMock = jest.fn();
const getAdminBlogCategoriesMock = jest.fn();

jest.mock("@/features/blogs/api", () => ({
  getAdminBlogPosts: (...args: unknown[]) => getAdminBlogPostsMock(...args),
  getAdminBlogPostById: (...args: unknown[]) => getAdminBlogPostByIdMock(...args),
  getAdminBlogCategories: (...args: unknown[]) => getAdminBlogCategoriesMock(...args),
  getFeaturedBlogPosts: jest.fn(),
  getPublicBlogCategories: jest.fn(),
  getPublicBlogPostBySlug: jest.fn(),
  getPublicBlogPosts: jest.fn(),
}));

const mockCategory = {
  id: "cat-1",
  name: "Brewing Guide",
  slug: "brewing-guide",
  description: "How-to guides",
  displayOrder: 0,
  isActive: true,
  createdAt: "2026-05-01T10:00:00Z",
  updatedAt: "2026-05-01T10:00:00Z",
};

const mockPost = {
  id: "post-1",
  title: "Pour over basics",
  slug: "pour-over-basics",
  excerpt: "A quick brew primer",
  coverImageUrl: null,
  status: "Draft" as const,
  isFeatured: false,
  displayOrder: 0,
  publishedAt: null,
  createdAt: "2026-05-01T10:00:00Z",
  updatedAt: "2026-05-02T10:00:00Z",
  categories: [mockCategory],
};

beforeEach(() => {
  jest.clearAllMocks();
  getAdminBlogPostsMock.mockResolvedValue({
    items: [mockPost],
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
  getAdminBlogPostByIdMock.mockResolvedValue({
    ...mockPost,
    contentHtml: "<p>Hello</p>",
    contentJson: '{"type":"doc"}',
    seoTitle: null,
    seoDescription: null,
  });
  getAdminBlogCategoriesMock.mockResolvedValue({
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
});

describe("use-blog-admin", () => {
  it("loads admin blog posts and exposes refetch", async () => {
    const { result } = renderHook(() => useAdminBlogPosts({ status: "Draft", takeAll: true }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAdminBlogPostsMock).toHaveBeenCalledWith({ status: "Draft", takeAll: true });
    expect(result.current.data).toHaveLength(1);

    await result.current.refetch();
    expect(getAdminBlogPostsMock).toHaveBeenCalledTimes(2);
  });

  it("loads a single admin post by id", async () => {
    const { result } = renderHook(() => useAdminBlogPost("post-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAdminBlogPostByIdMock).toHaveBeenCalledWith("post-1");
    expect(result.current.data?.slug).toBe("pour-over-basics");
  });

  it("does not fetch a single post when id is null", async () => {
    const { result } = renderHook(() => useAdminBlogPost(null));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAdminBlogPostByIdMock).not.toHaveBeenCalled();
    expect(result.current.data).toBeNull();
  });

  it("loads admin categories", async () => {
    const { result } = renderHook(() => useAdminBlogCategories());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(getAdminBlogCategoriesMock).toHaveBeenCalledWith(true);
    expect(result.current.data[0]?.name).toBe("Brewing Guide");
  });

  it("surfaces fetch errors", async () => {
    getAdminBlogPostsMock.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() => useAdminBlogPosts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("boom");
    expect(result.current.data).toEqual([]);
  });
});
