"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { StoreAvailabilitySummary } from "../types";

interface StoreStatusBadgeProps {
  availability?: StoreAvailabilitySummary;
  isActive?: boolean;
  mode?: "availability" | "active";
}

export function StoreStatusBadge({
  availability,
  isActive,
  mode = "availability",
}: StoreStatusBadgeProps) {
  const tStores = useTranslations("stores");
  const tAdmin = useTranslations("adminStores");

  if (mode === "active") {
    return (
      <Badge variant={isActive ? "success" : "error"}>
        {isActive ? tAdmin("active") : tAdmin("inactive")}
      </Badge>
    );
  }

  if (!availability) {
    return null;
  }

  if (availability.isOpenNow) {
    return <Badge variant="success">{tStores("openNow")}</Badge>;
  }

  if (availability.isClosedToday) {
    return <Badge variant="secondary">{tStores("closedToday")}</Badge>;
  }

  return <Badge variant="secondary">{tStores("closedNow")}</Badge>;
}
