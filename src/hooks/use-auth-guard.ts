"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Auth guard hook for authentication pages (sign-in, sign-up, forgot-password, reset-password)
 * Redirects authenticated users to the specified destination (default: homepage)
 *
 * @param redirectTo - Destination path for authenticated users (default: "/")
 * @returns Object with isLoading flag indicating redirect state
 */
export function useAuthGuard(redirectTo: string = "/"): { isLoading: boolean } {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Detect client-side mount to prevent hydration mismatch
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [mounted, isAuthenticated, redirectTo, router]);

  // Show loading state during SSR or while redirect happens
  return { isLoading: !mounted || isAuthenticated };
}
