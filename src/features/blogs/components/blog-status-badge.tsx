"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { BlogPostStatus } from "@/types/api";

interface BlogStatusBadgeProps {
  status: BlogPostStatus;
}

export function BlogStatusBadge({ status }: BlogStatusBadgeProps) {
  const t = useTranslations("adminBlog");

  const variant =
    status === "Published"
      ? "success"
      : status === "Archived"
        ? "outline"
        : "secondary";

  return (
    <Badge variant={variant}>
      {t(`status.${status.toLowerCase()}`)}
    </Badge>
  );
}
