import { render, screen } from "@testing-library/react";
import { BlogPreview } from "@/components/home/blog-preview";

const useFeaturedBlogPostsMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/features/blogs/hooks", () => ({
  useFeaturedBlogPosts: (...args: unknown[]) => useFeaturedBlogPostsMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("BlogPreview", () => {
  it("renders featured blog posts from the hook", () => {
    useFeaturedBlogPostsMock.mockReturnValue({
      data: [
        {
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
        },
      ],
      loading: false,
      error: null,
    });

    render(<BlogPreview />);

    expect(screen.getByText("latestBlog")).toBeInTheDocument();
    expect(screen.getByText("Pour over basics")).toBeInTheDocument();
  });

  it("renders a loading spinner while the featured posts are loading", () => {
    useFeaturedBlogPostsMock.mockReturnValue({
      data: [],
      loading: true,
      error: null,
    });

    const { container } = render(<BlogPreview />);

    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("renders an empty state when there are no featured blog posts", () => {
    useFeaturedBlogPostsMock.mockReturnValue({
      data: [],
      loading: false,
      error: null,
    });

    render(<BlogPreview />);

    expect(screen.getByText("blogEmptyTitle")).toBeInTheDocument();
  });
});
