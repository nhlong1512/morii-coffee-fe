"use client";

import { useEffect, useRef } from "react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useCartStore } from "@/stores/cart-store";

function CartSessionSync() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
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

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CartSessionSync />
      {children}
    </ThemeProvider>
  );
}
