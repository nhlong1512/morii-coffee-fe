import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "@/lib/api";
import type {
  GetAdminStoresOptions,
  GetPublicStoresOptions,
  ReorderStoresRequest,
  StoreLocation,
  StoresPage,
  UpdateStoreStatusRequest,
  UpsertStoreRequest,
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

function buildStoreQueryString(
  options: GetPublicStoresOptions | GetAdminStoresOptions = {}
) {
  const params = new URLSearchParams();

  appendQueryParam(params, "page", options.page);
  appendQueryParam(params, "size", options.size);
  appendQueryParam(params, "takeAll", options.takeAll ? "true" : undefined);
  appendQueryParam(params, "search", options.search);
  appendQueryParam(params, "city", options.city);

  if ("latitude" in options) {
    appendQueryParam(params, "latitude", options.latitude);
    appendQueryParam(params, "longitude", options.longitude);
    appendQueryParam(params, "radius", options.radius);
  }

  if ("isActive" in options) {
    appendQueryParam(params, "isActive", options.isActive);
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getPublicStores(
  options: GetPublicStoresOptions = { takeAll: true }
): Promise<StoresPage> {
  return apiGet<StoresPage>(`/v1/stores${buildStoreQueryString(options)}`);
}

export async function getPublicStoreById(id: string): Promise<StoreLocation> {
  return apiGet<StoreLocation>(`/v1/stores/${id}`);
}

export async function getAdminStores(
  options: GetAdminStoresOptions = { takeAll: true }
): Promise<StoresPage> {
  return apiGet<StoresPage>(`/v1/admin/stores${buildStoreQueryString(options)}`);
}

export async function getAdminStoreById(id: string): Promise<StoreLocation> {
  return apiGet<StoreLocation>(`/v1/admin/stores/${id}`);
}

export async function createStore(
  payload: UpsertStoreRequest
): Promise<StoreLocation> {
  return apiPost<StoreLocation>("/v1/admin/stores", payload);
}

export async function updateStore(
  id: string,
  payload: UpsertStoreRequest
): Promise<StoreLocation> {
  return apiPut<StoreLocation>(`/v1/admin/stores/${id}`, payload);
}

export async function deleteStore(id: string): Promise<void> {
  await apiDelete(`/v1/admin/stores/${id}`);
}

export async function updateStoreStatus(
  id: string,
  payload: UpdateStoreStatusRequest
): Promise<StoreLocation> {
  return apiPatch<StoreLocation>(`/v1/admin/stores/${id}/status`, payload);
}

export async function reorderStores(
  payload: ReorderStoresRequest
): Promise<void> {
  await apiPatch<void>("/v1/admin/stores/reorder", payload);
}
