import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import AdminBlogsPage from "@/app/admin/blogs/page";

const useAdminBlogPostsMock = jest.fn();
const useAdminBlogCategoriesMock = jest.fn();
const deleteBlogPostMock = jest.fn();
const reorderBlogCategoriesMock = jest.fn();
const reorderBlogPostsMock = jest.fn();
const updateBlogPostStatusMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    values?.title ? `${key}:${values.title}` : key,
}));

jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/features/blogs/hooks", () => ({
  useAdminBlogPosts: (...args: unknown[]) => useAdminBlogPostsMock(...args),
  useAdminBlogCategories: (...args: unknown[]) => useAdminBlogCategoriesMock(...args),
}));

jest.mock("@/features/blogs/api", () => ({
  deleteBlogPost: (...args: unknown[]) => deleteBlogPostMock(...args),
  reorderBlogCategories: (...args: unknown[]) => reorderBlogCategoriesMock(...args),
  reorderBlogPosts: (...args: unknown[]) => reorderBlogPostsMock(...args),
  updateBlogPostStatus: (...args: unknown[]) => updateBlogPostStatusMock(...args),
}));

jest.mock("@/features/blogs/components/blog-list-table", () => ({
  BlogListTable: ({
    posts,
    onDelete,
    onStatusChange,
  }: {
    posts: Array<{ id: string; title: string }>;
    onDelete: (post: { id: string; title: string }) => void;
    onStatusChange: (post: { id: string; title: string }, status: string) => void;
  }) => (
    <div>
      <span>posts:{posts.length}</span>
      <button type="button" onClick={() => onStatusChange(posts[0], "Published")}>
        publish-first
      </button>
      <button type="button" onClick={() => onDelete(posts[0])}>
        delete-first
      </button>
    </div>
  ),
}));

jest.mock("@/features/blogs/components/blog-category-manager", () => ({
  BlogCategoryManager: () => <div>category-manager</div>,
}));

jest.mock("@/features/blogs/components/blog-sort-manager", () => ({
  BlogSortManager: ({ title }: { title: string }) => <div>{title}</div>,
}));

const posts = [
  {
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
    updatedAt: "2026-05-01T10:00:00Z",
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
];

const categories = [
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
];

beforeEach(() => {
  jest.clearAllMocks();
  useAdminBlogPostsMock.mockReturnValue({
    data: posts,
    loading: false,
    error: null,
    refetch: jest.fn().mockResolvedValue(undefined),
  });
  useAdminBlogCategoriesMock.mockReturnValue({
    data: categories,
    loading: false,
    error: null,
    refetch: jest.fn().mockResolvedValue(undefined),
  });
  deleteBlogPostMock.mockResolvedValue(undefined);
  updateBlogPostStatusMock.mockResolvedValue(undefined);
  reorderBlogPostsMock.mockResolvedValue(undefined);
  reorderBlogCategoriesMock.mockResolvedValue(undefined);
});

describe("AdminBlogsPage", () => {
  it("renders the admin blog workspace and filters", () => {
    render(<AdminBlogsPage />);

    expect(screen.getByText("title")).toBeInTheDocument();
    expect(screen.getByText("posts:1")).toBeInTheDocument();
    expect(screen.getByLabelText("filters.status")).toHaveValue("all");
  });

  it("updates the status filter and refetches posts", () => {
    render(<AdminBlogsPage />);

    fireEvent.change(screen.getByLabelText("filters.status"), {
      target: { value: "Draft" },
    });

    expect(useAdminBlogPostsMock).toHaveBeenLastCalledWith({
      takeAll: true,
      status: "Draft",
    });
  });

  it("triggers publish and delete flows from the list", async () => {
    render(<AdminBlogsPage />);

    fireEvent.click(screen.getByRole("button", { name: "publish-first" }));
    await waitFor(() => {
      expect(updateBlogPostStatusMock).toHaveBeenCalledWith("post-1", {
        status: "Published",
      });
    });

    fireEvent.click(screen.getByRole("button", { name: "delete-first" }));
    fireEvent.click(screen.getByRole("button", { name: /confirm/i }));

    await waitFor(() => {
      expect(deleteBlogPostMock).toHaveBeenCalledWith("post-1");
    });
  });
});
