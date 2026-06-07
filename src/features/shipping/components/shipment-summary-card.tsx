"use client";

import { useLocale, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getShipmentStatusLabelKey,
  getShipmentStatusTone,
} from "@/features/shipping/utils";
import type { ShipmentSummary } from "@/types";

interface ShipmentSummaryCardProps {
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  shipment: ShipmentSummary | null;
}

export function ShipmentSummaryCard({
  title,
  emptyTitle,
  emptyDescription,
  shipment,
}: ShipmentSummaryCardProps) {
  const t = useTranslations("orderDetail");
  const locale = useLocale();

  if (!shipment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground">{emptyDescription}</p>
        </CardContent>
      </Card>
    );
  }

  const tone = getShipmentStatusTone(shipment.status);
  const statusLabelKey = getShipmentStatusLabelKey(shipment.status);

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>{title}</CardTitle>
          <Badge variant={tone.badgeVariant}>{t(statusLabelKey)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("shipmentProvider")}
          </p>
          <p className="text-sm font-medium text-foreground">
            {shipment.provider}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("shipmentTracking")}
          </p>
          <p className="break-all text-sm font-medium text-foreground">
            {shipment.providerOrderCode ?? shipment.clientOrderCode ?? t("shipmentPending")}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("shipmentExpectedDelivery")}
          </p>
          <p className="text-sm font-medium text-foreground">
            {shipment.expectedDeliveryAt
              ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(shipment.expectedDeliveryAt))
              : t("shipmentPending")}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {t("shipmentLastSynced")}
          </p>
          <p className="text-sm font-medium text-foreground">
            {shipment.lastSyncedAt
              ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(shipment.lastSyncedAt))
              : t("shipmentPending")}
          </p>
        </div>
        {shipment.failureReason ? (
          <div className="md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t("shipmentFailureReason")}
            </p>
            <p className="break-words text-sm font-medium text-foreground">
              {shipment.failureReason}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
