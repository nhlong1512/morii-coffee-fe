"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { getAdminLandingRoute } from "@/lib/auth";
import { selectHasValidSession, useAuthStore } from "@/stores/auth-store";

export default function AdminPage() {
  const router = useRouter();
  const roles = useAuthStore((state) => state.user?.roles);
  const hasValidSession = useAuthStore(selectHasValidSession);
  const setRedirectTo = useAuthStore((state) => state.setRedirectTo);

  useEffect(() => {
    if (!hasValidSession) {
      setRedirectTo(ROUTES.ADMIN.ROOT);
      router.replace(ROUTES.SIGN_IN);
      return;
    }

    router.replace(getAdminLandingRoute(roles));
  }, [hasValidSession, roles, router, setRedirectTo]);

  return null;
}
