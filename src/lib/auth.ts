import { ROUTES } from "@/constants/routes";
import { UserRole } from "@/enums";

export function hasValidAuthSession(state: {
  accessToken: string | null;
  isAuthenticated: boolean;
}): boolean {
  return state.isAuthenticated && Boolean(state.accessToken?.trim());
}

export function getAdminLandingRoute(roles: UserRole[] | undefined): string {
  if (!roles) {
    return ROUTES.HOME;
  }

  if (roles.includes(UserRole.Admin)) {
    return ROUTES.ADMIN.REPORTS;
  }

  if (roles.includes(UserRole.Staff)) {
    return ROUTES.ADMIN.STORES;
  }

  return ROUTES.HOME;
}
