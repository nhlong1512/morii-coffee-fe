import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { ApiCategory, ApiPagination } from "@/types/api";
import type { CreateCategoryRequest, UpdateCategoryRequest } from "@/interfaces/categories";
import { buildCategoryFormData } from "@/helpers/categories";

export type { CreateCategoryRequest, UpdateCategoryRequest };

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<ApiCategory[]> {
  const data = await apiGet<ApiPagination<ApiCategory>>("/v1/categories?takeAll=true");
  return data.items;
}

export async function getCategoryById(id: string): Promise<ApiCategory> {
  return apiGet<ApiCategory>(`/v1/categories/${id}`);
}

export async function createCategory(
  request: CreateCategoryRequest
): Promise<ApiCategory> {
  return apiPost<ApiCategory>("/v1/categories", buildCategoryFormData(request));
}

export async function updateCategory(
  id: string,
  request: UpdateCategoryRequest
): Promise<ApiCategory> {
  return apiPut<ApiCategory>(`/v1/categories/${id}`, buildCategoryFormData(request));
}

export async function deleteCategory(id: string): Promise<void> {
  await apiDelete(`/v1/categories/${id}`);
}
