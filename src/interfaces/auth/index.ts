import type { UserRole } from "@/enums";

export interface SignUpRequest {
  email: string;
  phoneNumber: string;
  password: string;
  userName: string;
}

export interface SignInRequest {
  identity: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
  bio: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface AssignRolesRequest {
  roles: UserRole[];
}

export interface GetUsersParams {
  page?: number;
  size?: number;
  takeAll?: boolean;
  search?: string;
  status?: string;
}
