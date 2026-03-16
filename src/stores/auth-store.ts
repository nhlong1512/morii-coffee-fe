import { create } from "zustand";
import { dummyUser, type User } from "@/data/user";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,

  login: (_email: string, _password: string) => {
    // Simulate login with dummy user data
    set({
      user: dummyUser,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  updateProfile: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
