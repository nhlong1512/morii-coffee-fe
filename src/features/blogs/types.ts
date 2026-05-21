import type {
  ApiBlogCategory,
  ApiBlogPostDetail,
  ApiBlogPostSummary,
  BlogPostStatus,
} from "@/types/api";

export type { ApiBlogCategory, ApiBlogPostDetail, ApiBlogPostSummary, BlogPostStatus };

export interface BlogPostsQuery {
  page?: number;
  size?: number;
  takeAll?: boolean;
  status?: BlogPostStatus | "all";
  categoryId?: string;
  search?: string;
}

export interface PublicBlogPostsQuery {
  page?: number;
  size?: number;
  takeAll?: boolean;
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
}

export interface UpsertBlogPostRequest {
  title: string;
  slug?: string | null;
  excerpt: string | null;
  contentHtml: string;
  contentJson: string | null;
  coverImageUrl: string | null;
  coverImageFileName: string | null;
  categoryIds: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  isFeatured: boolean;
  displayOrder: number;
  status: BlogPostStatus;
}

export interface UpdateBlogPostStatusRequest {
  status: BlogPostStatus;
}

export interface ReorderBlogPostsRequest {
  items: Array<{
    id: string;
    displayOrder: number;
  }>;
}

export interface UpsertBlogCategoryRequest {
  name: string;
  slug?: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface ReorderBlogCategoriesRequest {
  items: Array<{
    id: string;
    displayOrder: number;
  }>;
}

export interface BlogPostFormValues {
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  contentJson: string;
  coverImageUrl: string | null;
  coverImageFileName: string | null;
  categoryIds: string[];
  seoTitle: string;
  seoDescription: string;
  isFeatured: boolean;
  displayOrder: number;
  status: BlogPostStatus;
}

export interface SortableEntityItem {
  id: string;
  name: string;
  displayOrder: number;
}
