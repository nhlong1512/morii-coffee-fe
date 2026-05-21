import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BlogForm } from "@/features/blogs/components/blog-form";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/features/blogs/components/blog-editor", () => ({
  BlogEditor: ({
    value,
    onChange,
    error,
  }: {
    value: { contentHtml: string; contentJson: string | null };
    onChange: (value: { contentHtml: string; contentJson: string }) => void;
    error?: string;
  }) => (
    <div>
      <textarea
        aria-label="editor"
        value={value.contentHtml}
        onChange={(event) =>
          onChange({
            contentHtml: event.target.value,
            contentJson: '{"type":"doc"}',
          })
        }
      />
      {error ? <span>{error}</span> : null}
    </div>
  ),
}));

jest.mock("@/components/admin/image-upload", () => ({
  ImageUpload: ({
    onChange,
    onUploaded,
  }: {
    onChange: (value: string) => void;
    onUploaded?: (blob: { uri: string; name: string }) => void;
  }) => (
    <button
      type="button"
      onClick={() => {
        onChange("/images/blog.jpg");
        onUploaded?.({ uri: "/images/blog.jpg", name: "blog.jpg" });
      }}
    >
      upload-image
    </button>
  ),
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

describe("BlogForm", () => {
  it("auto-generates the slug from the title", async () => {
    render(
      <BlogForm
        mode="create"
        categories={categories}
        cancelHref="/admin/blogs"
        onSubmit={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("fields.title"), {
      target: { value: "Cà phê sữa đá" },
    });

    await waitFor(() => {
      expect(screen.getByLabelText("fields.slug")).toHaveValue("ca-phe-sua-da");
    });
  });

  it("submits with normalized values from the form", async () => {
    const onSubmit = jest.fn();

    render(
      <BlogForm
        mode="create"
        categories={categories}
        cancelHref="/admin/blogs"
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText("fields.title"), {
      target: { value: "Pour over basics" },
    });
    fireEvent.change(screen.getByLabelText("fields.excerpt"), {
      target: { value: "A short summary" },
    });
    fireEvent.change(screen.getByLabelText("editor"), {
      target: { value: "<p>Hello</p>" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "upload-image" }));
    fireEvent.click(screen.getByRole("button", { name: "actions.create" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
      expect(onSubmit.mock.calls[0]?.[0]).toEqual(
        expect.objectContaining({
          title: "Pour over basics",
          slug: "pour-over-basics",
          excerpt: "A short summary",
          contentHtml: "<p>Hello</p>",
          contentJson: '{"type":"doc"}',
          coverImageUrl: "/images/blog.jpg",
          coverImageFileName: "blog.jpg",
          categoryIds: ["cat-1"],
          status: "Draft",
        })
      );
    });
  });
});
