import { apiPost } from "@/lib/api";
import { encryptPassword } from "@/utils/rsa-encrypt";
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
// Passwords are RSA-OAEP encrypted before transmission.
// ---------------------------------------------------------------------------

export async function signUp(data: SignUpRequest): Promise<ApiAuthResponse> {
  const encryptedPassword = await encryptPassword(data.password);
  return apiPost<ApiAuthResponse>(
    "/v1/auth/signup",
    { ...data, password: encryptedPassword },
    { skipAuth: true }
  );
}

export async function signIn(data: SignInRequest): Promise<ApiAuthResponse> {
  const encryptedPassword = await encryptPassword(data.password);
  return apiPost<ApiAuthResponse>(
    "/v1/auth/signin",
    { ...data, password: encryptedPassword },
    { skipAuth: true }
  );
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
  const encryptedPassword = await encryptPassword(data.newPassword);
  await apiPost<string>(
    "/v1/auth/reset-password",
    { ...data, newPassword: encryptedPassword },
    { skipAuth: true }
  );
}
