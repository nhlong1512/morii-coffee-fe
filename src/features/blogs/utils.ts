import type { BlogPostStatus } from "@/types/api";

export const BLOG_POST_STATUSES = ["Draft", "Published", "Archived"] as const;

export const EMPTY_BLOG_CONTENT_JSON = JSON.stringify({
  type: "doc",
  content: [
    {
      type: "paragraph",
    },
  ],
});

export function generateBlogSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function hasMeaningfulHtmlContent(value: string): boolean {
  const withoutTags = value
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return withoutTags.length > 0;
}

export function sanitizeBlogHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

export function safeParseJson(value: string | null | undefined): unknown {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function getBlogStatusLabelKey(status: BlogPostStatus): string {
  return `adminBlog.status.${status.toLowerCase()}`;
}
