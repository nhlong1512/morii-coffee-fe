"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/enums";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminPage() {
  const router = useRouter();
  const roles = useAuthStore((state) => state.user?.roles ?? []);

  useEffect(() => {
    if (roles.includes(UserRole.Admin)) {
      router.replace(ROUTES.ADMIN.REPORTS);
      return;
    }

    if (roles.includes(UserRole.Staff)) {
      router.replace(ROUTES.ADMIN.STORES);
      return;
    }

    router.replace(ROUTES.ADMIN.LOGIN);
  }, [roles, router]);

  return null;
}
