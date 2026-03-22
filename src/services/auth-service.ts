import { apiPost } from "@/lib/api";
import type { ApiAuthResponse } from "@/types/api";
import type {
  SignUpRequest,
  SignInRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/interfaces/auth";

export type {
  SignUpRequest,
  SignInRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/interfaces/auth";

// ---------------------------------------------------------------------------
// Auth API — all endpoints skip automatic Bearer token attachment
// ---------------------------------------------------------------------------

export async function signUp(data: SignUpRequest): Promise<ApiAuthResponse> {
  return apiPost<ApiAuthResponse>("/v1/auth/signup", data, { skipAuth: true });
}

export async function signIn(data: SignInRequest): Promise<ApiAuthResponse> {
  return apiPost<ApiAuthResponse>("/v1/auth/signin", data, { skipAuth: true });
}

export async function refreshToken(
  data: RefreshTokenRequest,
  expiredAccessToken?: string
): Promise<ApiAuthResponse> {
  return apiPost<ApiAuthResponse>("/v1/auth/refresh-token", data, {
    skipAuth: true,
    headers: expiredAccessToken
      ? { Authorization: `Bearer ${expiredAccessToken}` }
      : {},
  });
}

export async function forgotPassword(
  data: ForgotPasswordRequest
): Promise<void> {
  await apiPost<string>("/v1/auth/forgot-password", data, { skipAuth: true });
}

export async function resetPassword(
  data: ResetPasswordRequest
): Promise<void> {
  await apiPost<string>("/v1/auth/reset-password", data, { skipAuth: true });
}
