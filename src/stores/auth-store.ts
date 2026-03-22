import { create } from "zustand";
import { persist } from "zustand/middleware";
import { registerAuthHandlers } from "@/lib/api";
import { UserRole } from "@/enums";
import type { ApiUserProfile } from "@/types/api";
import * as authService from "@/services/auth-service";
import * as userService from "@/services/user-service";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AuthState {
  user: ApiUserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

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
}

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
        });
      },

      syncProfile: async () => {
        try {
          const user = await userService.getMe();
          set({ user });
        } catch {
          // If profile fetch fails (e.g. token invalid), clear session
          get().logout();
        }
      },

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      hasRole: (role) => {
        const { user } = get();
        return user?.roles?.includes(role) ?? false;
      },
    }),
    {
      name: "morii-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
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
    useAuthStore.getState().logout();
    // Redirect to sign-in if in browser
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
  }
);
