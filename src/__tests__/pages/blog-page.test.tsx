import { fireEvent, render, screen } from "@testing-library/react";
import BlogPage from "@/app/blog/page";

const usePublicBlogPostsMock = jest.fn();
const usePublicBlogCategoriesMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/features/blogs/hooks", () => ({
  usePublicBlogPosts: (...args: unknown[]) => usePublicBlogPostsMock(...args),
  usePublicBlogCategories: (...args: unknown[]) => usePublicBlogCategoriesMock(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  usePublicBlogPostsMock.mockReturnValue({
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
        categories: [
          {
            id: "cat-1",
            name: "Brewing Guide",
            slug: "brewing-guide",
            description: null,
            displayOrder: 0,
            isActive: true,
            createdAt: "2026-05-01T10:00:00Z",
            updatedAt: "2026-05-01T10:00:00Z",
          },
        ],
      },
      {
        id: "post-2",
        title: "Coffee origins",
        slug: "coffee-origins",
        excerpt: "Where beans begin",
        coverImageUrl: null,
        status: "Published",
        isFeatured: false,
        displayOrder: 1,
        publishedAt: "2026-05-03T10:00:00Z",
        createdAt: "2026-05-02T10:00:00Z",
        updatedAt: "2026-05-03T10:00:00Z",
        categories: [],
      },
    ],
    loading: false,
    error: null,
  });
  usePublicBlogCategoriesMock.mockReturnValue({
    data: [
      {
        id: "cat-1",
        name: "Brewing Guide",
        slug: "brewing-guide",
        description: null,
        displayOrder: 0,
        isActive: true,
        createdAt: "2026-05-01T10:00:00Z",
        updatedAt: "2026-05-01T10:00:00Z",
      },
    ],
    loading: false,
    error: null,
  });
});

describe("BlogPage", () => {
  it("renders API-backed blog posts", () => {
    render(<BlogPage />);

    expect(screen.getByText("Pour over basics")).toBeInTheDocument();
    expect(screen.getByText("Coffee origins")).toBeInTheDocument();
  });

  it("filters posts by search and category", () => {
    render(<BlogPage />);

    fireEvent.click(screen.getByRole("button", { name: "Brewing Guide" }));
    expect(screen.getByText("Pour over basics")).toBeInTheDocument();
    expect(screen.queryByText("Coffee origins")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "allCategories" }));
    fireEvent.change(screen.getByPlaceholderText("searchPlaceholder"), {
      target: { value: "origins" },
    });

    expect(screen.queryByText("Pour over basics")).toBeNull();
    expect(screen.getByText("Coffee origins")).toBeInTheDocument();
  });
});
