import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BlogCategoryManager } from "@/features/blogs/components/blog-category-manager";

const createBlogCategoryMock = jest.fn();
const updateBlogCategoryMock = jest.fn();
const deleteBlogCategoryMock = jest.fn();

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    values?.title ? `${key}:${values.title}` : key,
}));

jest.mock("@/features/blogs/api", () => ({
  createBlogCategory: (...args: unknown[]) => createBlogCategoryMock(...args),
  updateBlogCategory: (...args: unknown[]) => updateBlogCategoryMock(...args),
  deleteBlogCategory: (...args: unknown[]) => deleteBlogCategoryMock(...args),
}));

const categories = [
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
];

beforeEach(() => {
  jest.clearAllMocks();
  createBlogCategoryMock.mockResolvedValue(categories[0]);
  updateBlogCategoryMock.mockResolvedValue(categories[0]);
  deleteBlogCategoryMock.mockResolvedValue(undefined);
});

describe("BlogCategoryManager", () => {
  it("creates a category with a generated slug", async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    render(<BlogCategoryManager categories={categories} onRefresh={onRefresh} />);

    fireEvent.change(screen.getByLabelText("fields.categoryName"), {
      target: { value: "Coffee Origin" },
    });
    fireEvent.click(screen.getByRole("button", { name: "actions.addCategory" }));

    await waitFor(() => {
      expect(createBlogCategoryMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Coffee Origin",
          slug: "coffee-origin",
        })
      );
    });
  });

  it("edits and saves an existing category", async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);

    render(<BlogCategoryManager categories={categories} onRefresh={onRefresh} />);

    fireEvent.click(screen.getByRole("button", { name: "actions.edit" }));
    fireEvent.change(screen.getAllByLabelText("fields.categoryName")[1], {
      target: { value: "Updated Guide" },
    });
    fireEvent.click(screen.getByRole("button", { name: "actions.save" }));

    await waitFor(() => {
      expect(updateBlogCategoryMock).toHaveBeenCalledWith(
        "cat-1",
        expect.objectContaining({ name: "Updated Guide" })
      );
    });
  });
});
