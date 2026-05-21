import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type {
  ApiBlogCategory,
  ApiBlogPostDetail,
  ApiBlogPostSummary,
  ApiPagination,
} from "@/types/api";
import type {
  BlogPostsQuery,
  PublicBlogPostsQuery,
  ReorderBlogCategoriesRequest,
  ReorderBlogPostsRequest,
  UpdateBlogPostStatusRequest,
  UpsertBlogCategoryRequest,
  UpsertBlogPostRequest,
} from "./types";

function appendQueryParam(
  params: URLSearchParams,
  key: string,
  value: string | number | boolean | null | undefined
) {
  if (value === null || value === undefined || value === "") {
    return;
  }

  params.set(key, String(value));
}

function buildQueryString(
  value: BlogPostsQuery | PublicBlogPostsQuery = {}
): string {
  const params = new URLSearchParams();

  appendQueryParam(params, "page", value.page);
  appendQueryParam(params, "size", value.size);
  appendQueryParam(params, "takeAll", value.takeAll ? "true" : undefined);

  if ("status" in value) {
    appendQueryParam(
      params,
      "status",
      value.status && value.status !== "all" ? value.status : undefined
    );
    appendQueryParam(params, "categoryId", value.categoryId);
  }

  if ("categorySlug" in value) {
    appendQueryParam(params, "categorySlug", value.categorySlug);
    appendQueryParam(
      params,
      "featuredOnly",
      value.featuredOnly ? "true" : undefined
    );
  }

  appendQueryParam(params, "search", value.search);

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getAdminBlogPosts(
  query: BlogPostsQuery = {}
): Promise<ApiPagination<ApiBlogPostSummary>> {
  return apiGet<ApiPagination<ApiBlogPostSummary>>(
    `/v1/admin/blog-posts${buildQueryString(query)}`
  );
}

export async function getAdminBlogPostById(
  id: string
): Promise<ApiBlogPostDetail> {
  return apiGet<ApiBlogPostDetail>(`/v1/admin/blog-posts/${id}`);
}

export async function createBlogPost(
  request: UpsertBlogPostRequest
): Promise<ApiBlogPostDetail> {
  return apiPost<ApiBlogPostDetail>("/v1/admin/blog-posts", request);
}

export async function updateBlogPost(
  id: string,
  request: UpsertBlogPostRequest
): Promise<ApiBlogPostDetail> {
  return apiPut<ApiBlogPostDetail>(`/v1/admin/blog-posts/${id}`, request);
}

export async function updateBlogPostStatus(
  id: string,
  request: UpdateBlogPostStatusRequest
): Promise<ApiBlogPostDetail> {
  return apiPatch<ApiBlogPostDetail>(
    `/v1/admin/blog-posts/${id}/status`,
    request
  );
}

export async function deleteBlogPost(id: string): Promise<void> {
  await apiDelete(`/v1/admin/blog-posts/${id}`);
}

export async function reorderBlogPosts(
  request: ReorderBlogPostsRequest
): Promise<void> {
  await apiPatch<void>("/v1/admin/blog-posts/reorder", request);
}

export async function getAdminBlogCategories(
  takeAll: boolean = true
): Promise<ApiPagination<ApiBlogCategory>> {
  return apiGet<ApiPagination<ApiBlogCategory>>(
    `/v1/admin/blog-categories${takeAll ? "?takeAll=true" : ""}`
  );
}

export async function createBlogCategory(
  request: UpsertBlogCategoryRequest
): Promise<ApiBlogCategory> {
  return apiPost<ApiBlogCategory>("/v1/admin/blog-categories", request);
}

export async function updateBlogCategory(
  id: string,
  request: UpsertBlogCategoryRequest
): Promise<ApiBlogCategory> {
  return apiPut<ApiBlogCategory>(`/v1/admin/blog-categories/${id}`, request);
}

export async function deleteBlogCategory(id: string): Promise<void> {
  await apiDelete(`/v1/admin/blog-categories/${id}`);
}

export async function reorderBlogCategories(
  request: ReorderBlogCategoriesRequest
): Promise<void> {
  await apiPatch<void>("/v1/admin/blog-categories/reorder", request);
}

export async function getPublicBlogPosts(
  query: PublicBlogPostsQuery = {}
): Promise<ApiPagination<ApiBlogPostSummary>> {
  return apiGet<ApiPagination<ApiBlogPostSummary>>(
    `/v1/blog-posts${buildQueryString(query)}`
  );
}

export async function getPublicBlogPostBySlug(
  slug: string
): Promise<ApiBlogPostDetail> {
  return apiGet<ApiBlogPostDetail>(`/v1/blog-posts/${slug}`);
}

export async function getPublicBlogCategories(): Promise<ApiBlogCategory[]> {
  const response = await apiGet<ApiPagination<ApiBlogCategory>>(
    "/v1/blog-categories?takeAll=true&activeOnly=true"
  );
  return response.items;
}

export async function getFeaturedBlogPosts(
  take: number = 3
): Promise<ApiBlogPostSummary[]> {
  const response = await apiGet<ApiBlogPostSummary[]>(
    `/v1/blog-posts/featured?take=${take}`
  );
  return response;
}
