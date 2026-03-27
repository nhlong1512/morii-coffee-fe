"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Protected route hook for pages that require authentication
 * Redirects unauthenticated users to sign-in and stores the intended destination
 *
 * @returns Object with isLoading and isAuthenticated flags
 */
export function useProtectedRoute(): {
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setRedirectTo = useAuthStore((s) => s.setRedirectTo);

  // Detect client-side mount to prevent hydration mismatch
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      // Store intended destination before redirect
      setRedirectTo(pathname);
      router.replace("/sign-in");
    }
  }, [mounted, isAuthenticated, pathname, setRedirectTo, router]);

  // Show loading state during SSR or while redirect happens
  return {
    isLoading: !mounted || !isAuthenticated,
    isAuthenticated,
  };
}
