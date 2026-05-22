"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StoreStatusBadge } from "./store-status-badge";
import { formatDistanceKm, getStoreAvailability, sortStoresForDisplay } from "../utils";
import type { StoreLocation } from "../types";

interface StoreLocatorPreviewListProps {
  stores: StoreLocation[];
  limit?: number;
}

export function StoreLocatorPreviewList({
  stores,
  limit = 3,
}: StoreLocatorPreviewListProps) {
  const t = useTranslations("stores");
  const displayStores = sortStoresForDisplay(stores).slice(0, limit);

  if (displayStores.length === 0) {
    return (
      <EmptyState
        icon={<MapPin className="h-10 w-10" />}
        title={t("noResultsTitle")}
        description={t("noResultsDescription")}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {displayStores.map((store) => {
        const availability = getStoreAvailability(store);
        const distance = formatDistanceKm(store.distanceKm);

        return (
          <Card key={store.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{store.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{store.city}</p>
                  </div>
                </div>
                <StoreStatusBadge availability={availability} />
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{store.phone}</span>
                </div>
                <div className="flex items-start gap-2.5 text-muted-foreground">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{availability.todayHoursLabel}</span>
                </div>
              </div>

              {distance && (
                <p className="mt-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {t("distance", { distance })}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
