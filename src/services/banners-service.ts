import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type { ApiBanner } from "@/types/api";
import type { CreateBannerRequest, UpdateBannerRequest } from "@/interfaces/banners";
import { buildBannerFormData } from "@/helpers/banners";

// ---------------------------------------------------------------------------
// Banners — GET /v1/banners returns a plain array, not a paginated object
// ---------------------------------------------------------------------------

export async function getBanners(): Promise<ApiBanner[]> {
  return apiGet<ApiBanner[]>("/v1/banners");
}

export async function getBannerById(id: string): Promise<ApiBanner> {
  return apiGet<ApiBanner>(`/v1/banners/${id}`);
}

export async function createBanner(request: CreateBannerRequest): Promise<ApiBanner> {
  return apiPost<ApiBanner>("/v1/banners", buildBannerFormData(request));
}

export async function updateBanner(
  id: string,
  request: UpdateBannerRequest
): Promise<ApiBanner> {
  return apiPut<ApiBanner>(`/v1/banners/${id}`, buildBannerFormData(request));
}

export async function deleteBanner(id: string): Promise<void> {
  await apiDelete(`/v1/banners/${id}`);
}
