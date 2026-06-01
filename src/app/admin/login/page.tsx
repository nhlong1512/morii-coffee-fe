"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAdminLandingRoute } from "@/lib/auth";
import { selectHasValidSession, useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/constants/routes";

export default function AdminLoginPage() {
  const router = useRouter();
  const roles = useAuthStore((state) => state.user?.roles);
  const hasValidSession = useAuthStore(selectHasValidSession);
  const setRedirectTo = useAuthStore((state) => state.setRedirectTo);

  useEffect(() => {
    if (hasValidSession) {
      router.replace(getAdminLandingRoute(roles));
      return;
    }

    setRedirectTo(ROUTES.ADMIN.REPORTS);
    router.replace(ROUTES.SIGN_IN);
  }, [hasValidSession, roles, router, setRedirectTo]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingSpinner variant="logo" size="md" />
    </div>
  );
}
