import { apiGet, apiPut } from "@/lib/api";
import type {
  ApiUserProfile,
  ApiUserListItem,
  ApiPagination,
} from "@/types/api";
import type { UserRole } from "@/enums";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  GetUsersParams,
} from "@/interfaces/auth";

export type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  GetUsersParams,
} from "@/interfaces/auth";

// ---------------------------------------------------------------------------
// Current user endpoints (authenticated)
// ---------------------------------------------------------------------------

export async function getMe(): Promise<ApiUserProfile> {
  return apiGet<ApiUserProfile>("/v1/users/me");
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<ApiUserProfile> {
  return apiPut<ApiUserProfile>("/v1/users/me/profile", data);
}

export async function changeAvatar(file: File): Promise<ApiUserProfile> {
  const fd = new FormData();
  fd.append("Avatar", file);
  return apiPut<ApiUserProfile>("/v1/users/me/avatar", fd);
}

export async function changePassword(
  data: ChangePasswordRequest
): Promise<void> {
  await apiPut<string>("/v1/users/me/change-password", data);
}

// ---------------------------------------------------------------------------
// Admin-only endpoints
// ---------------------------------------------------------------------------

export async function getUsers(
  params: GetUsersParams = {}
): Promise<ApiPagination<ApiUserListItem>> {
  const qs = new URLSearchParams();
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.size !== undefined) qs.set("size", String(params.size));
  if (params.takeAll) qs.set("takeAll", "true");
  if (params.search) qs.set("search", params.search);
  if (params.status) qs.set("status", params.status);

  const query = qs.toString();
  const url = query ? `/v1/users?${query}` : "/v1/users";
  return apiGet<ApiPagination<ApiUserListItem>>(url);
}

export async function getUserById(id: string): Promise<ApiUserProfile> {
  return apiGet<ApiUserProfile>(`/v1/users/${id}`);
}

export async function assignRoles(
  id: string,
  roles: UserRole[]
): Promise<void> {
  await apiPut<string>(`/v1/users/${id}/roles`, { roles });
}
