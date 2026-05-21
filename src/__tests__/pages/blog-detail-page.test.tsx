import { render, screen } from "@testing-library/react";
import BlogDetailPage from "@/app/blog/[slug]/page";

const usePublicBlogPostMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  useParams: () => ({ slug: "pour-over-basics" }),
}));

jest.mock("@/features/blogs/hooks", () => ({
  usePublicBlogPost: (...args: unknown[]) => usePublicBlogPostMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("BlogDetailPage", () => {
  it("renders the blog content and strips scripts", () => {
    usePublicBlogPostMock.mockReturnValue({
      data: {
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
        categories: [],
        contentHtml: '<p>Safe content</p><script>alert("x")</script>',
        contentJson: '{"type":"doc"}',
        seoTitle: null,
        seoDescription: null,
      },
      loading: false,
      error: null,
    });

    const { container } = render(<BlogDetailPage />);

    expect(screen.getByText("Pour over basics")).toBeInTheDocument();
    expect(container.querySelector(".prose")?.innerHTML).toContain("Safe content");
    expect(container.querySelector(".prose")?.innerHTML).not.toContain("<script>");
  });

  it("renders the empty state when no post is returned", () => {
    usePublicBlogPostMock.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });

    render(<BlogDetailPage />);

    expect(screen.getByText("detailNotFoundTitle")).toBeInTheDocument();
  });
});
