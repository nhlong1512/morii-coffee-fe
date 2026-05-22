"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ROUTES } from "@/constants/routes";
import { StoreLocatorPreviewList, usePublicStores } from "@/features/stores";

export function StoreLocatorPreview() {
  const t = useTranslations("home");
  const { data, loading, error, refetch } = usePublicStores({ takeAll: true });

  return (
    <section className="py-16 bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {t("storeLocator")}
          </h2>
          <Button asChild variant="ghost" className="gap-1 text-muted-foreground">
            <Link href={ROUTES.STORES}>
              {t("viewAll")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner variant="spinner" size="md" />
          </div>
        ) : error ? (
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 text-center">
            <ErrorMessage message={error} inline={false} />
            <Button variant="outline" onClick={refetch}>
              {t("viewAll")}
            </Button>
          </div>
        ) : data.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
            <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              {t("storeLocator")}
            </p>
          </div>
        ) : (
          <StoreLocatorPreviewList stores={data} limit={3} />
        )}
      </div>
    </section>
  );
}
