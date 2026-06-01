"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import {
  AUTH_STORAGE_KEY,
  selectHasValidSession,
  useAuthStore,
} from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";

function CartSessionSync() {
  const isAuthenticated = useAuthStore(selectHasValidSession);
  const initializeForSession = useCartStore((state) => state.initializeForSession);
  const resetAfterLogout = useCartStore((state) => state.resetAfterLogout);
  const previousAuthState = useRef<boolean | null>(null);

  useEffect(() => {
    const previous = previousAuthState.current;
    previousAuthState.current = isAuthenticated;

    if (previous === null) {
      void initializeForSession(isAuthenticated);
      return;
    }

    if (isAuthenticated) {
      void initializeForSession(true);
      return;
    }

    resetAfterLogout();
  }, [initializeForSession, isAuthenticated, resetAfterLogout]);

  return null;
}

function WishlistSessionSync() {
  const isAuthenticated = useAuthStore(selectHasValidSession);
  const initializeForSession = useWishlistStore((state) => state.initializeForSession);
  const resetAfterLogout = useWishlistStore((state) => state.resetAfterLogout);
  const previousAuthState = useRef<boolean | null>(null);

  useEffect(() => {
    const previous = previousAuthState.current;
    previousAuthState.current = isAuthenticated;

    if (previous === null) {
      void initializeForSession(isAuthenticated);
      return;
    }

    if (isAuthenticated) {
      void initializeForSession(true);
      return;
    }

    resetAfterLogout();
  }, [initializeForSession, isAuthenticated, resetAfterLogout]);

  return null;
}

function AuthStorageSync() {
  useEffect(() => {
    const syncAuthState = (event: StorageEvent) => {
      if (event.key === AUTH_STORAGE_KEY) {
        void useAuthStore.persist.rehydrate();
      }
    };

    window.addEventListener("storage", syncAuthState);
    return () => window.removeEventListener("storage", syncAuthState);
  }, []);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CartSessionSync />
      <WishlistSessionSync />
      <AuthStorageSync />
      {children}
    </ThemeProvider>
  );
}
