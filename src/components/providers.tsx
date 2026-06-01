"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { selectHasValidSession, useAuthStore } from "@/stores/auth-store";
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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CartSessionSync />
      <WishlistSessionSync />
      {children}
    </ThemeProvider>
  );
}
