import { z } from "zod";
import type { BlogPostFormValues, UpsertBlogCategoryRequest } from "./types";
import { BLOG_POST_STATUSES, EMPTY_BLOG_CONTENT_JSON, generateBlogSlug, hasMeaningfulHtmlContent } from "./utils";

export const blogPostSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    slug: z.string().trim(),
    excerpt: z.string().trim(),
    contentHtml: z.string(),
    contentJson: z.string(),
    coverImageUrl: z.string().nullable(),
    coverImageFileName: z.string().nullable(),
    categoryIds: z.array(z.string()),
    seoTitle: z.string().trim(),
    seoDescription: z.string().trim(),
    isFeatured: z.boolean(),
    displayOrder: z.number().int().min(0, "Display order must be 0 or greater."),
    status: z.enum(BLOG_POST_STATUSES),
  })
  .superRefine((value, ctx) => {
    if (value.status !== "Published") {
      return;
    }

    if (generateBlogSlug(value.slug || value.title).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Slug is required to publish a post.",
        path: ["slug"],
      });
    }

    if (!hasMeaningfulHtmlContent(value.contentHtml)) {
      ctx.addIssue({
        code: "custom",
        message: "Content is required to publish a post.",
        path: ["contentHtml"],
      });
    }

    if (value.categoryIds.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Select at least one category before publishing.",
        path: ["categoryIds"],
      });
    }
  });

export const blogCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required."),
  slug: z.string().trim(),
  description: z.string().trim(),
  displayOrder: z.number().int().min(0, "Display order must be 0 or greater."),
  isActive: z.boolean(),
});

export type BlogPostSchemaValues = z.infer<typeof blogPostSchema>;
export type BlogCategorySchemaValues = z.infer<typeof blogCategorySchema>;

export function createDefaultBlogPostValues(): BlogPostFormValues {
  return {
    title: "",
    slug: "",
    excerpt: "",
    contentHtml: "",
    contentJson: EMPTY_BLOG_CONTENT_JSON,
    coverImageUrl: null,
    coverImageFileName: null,
    categoryIds: [],
    seoTitle: "",
    seoDescription: "",
    isFeatured: false,
    displayOrder: 0,
    status: "Draft",
  };
}

export function createDefaultBlogCategoryValues(): UpsertBlogCategoryRequest {
  return {
    name: "",
    slug: "",
    description: "",
    displayOrder: 0,
    isActive: true,
  };
}
