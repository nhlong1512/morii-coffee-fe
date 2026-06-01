import { create } from "zustand";
import { persist } from "zustand/middleware";
import { registerAuthHandlers } from "@/lib/api";
import { hasValidAuthSession } from "@/lib/auth";
import { UserRole } from "@/enums";
import { ROUTES } from "@/constants/routes";
import type { ApiUserProfile } from "@/types/api";
import * as authService from "@/services/auth-service";
import * as userService from "@/services/user-service";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export interface AuthState {
  user: ApiUserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  redirectTo: string | null;

  // Actions
  signIn: (identity: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    phoneNumber: string,
    password: string,
    userName: string
  ) => Promise<void>;
  logout: () => void;
  syncProfile: () => Promise<void>;
  setUser: (user: ApiUserProfile) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  hasRole: (role: UserRole) => boolean;
  setRedirectTo: (path: string) => void;
  clearRedirectTo: () => void;
  getAndClearRedirectTo: () => string | null;
}

export const selectHasValidSession = (state: AuthState): boolean =>
  hasValidAuthSession(state);

export const AUTH_STORAGE_KEY = "morii-auth";

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      redirectTo: null,

      signIn: async (identity, password) => {
        const res = await authService.signIn({ identity, password });
        set({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          isAuthenticated: true,
        });
      },

      signUp: async (email, phoneNumber, password, userName) => {
        const res = await authService.signUp({
          email,
          phoneNumber,
          password,
          userName,
        });
        set({
          user: res.user,
          accessToken: res.accessToken,
          refreshToken: res.refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          redirectTo: null,
        });
      },

      syncProfile: async () => {
        const user = await userService.getMe();
        set({ user });
      },

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
          isAuthenticated: Boolean(accessToken.trim()),
        }),

      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.includes(role) ?? false;
      },

      setRedirectTo: (path) => set({ redirectTo: path }),

      clearRedirectTo: () => set({ redirectTo: null }),

      getAndClearRedirectTo: () => {
        const { redirectTo } = get();
        set({ redirectTo: null });
        return redirectTo;
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        redirectTo: state.redirectTo,
      }),
    }
  )
);

// ---------------------------------------------------------------------------
// Register auth handlers with the API client on module load
// ---------------------------------------------------------------------------

registerAuthHandlers(
  () => ({
    accessToken: useAuthStore.getState().accessToken,
    refreshToken: useAuthStore.getState().refreshToken,
  }),
  (accessToken, refreshToken) => {
    useAuthStore.getState().setTokens(accessToken, refreshToken);
  },
  () => {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : null;
    useAuthStore.getState().logout();
    if (typeof window !== "undefined") {
      if (
        redirectTo &&
        redirectTo !== ROUTES.SIGN_IN &&
        redirectTo !== ROUTES.ADMIN.LOGIN
      ) {
        useAuthStore.getState().setRedirectTo(redirectTo);
      }
      window.location.href = ROUTES.SIGN_IN;
    }
  }
);
