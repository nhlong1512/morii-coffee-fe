"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getShipmentStatusTone } from "@/features/shipping/utils";
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

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{title}</CardTitle>
          <Badge variant={tone.badgeVariant}>{shipment.statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Provider
          </p>
          <p className="text-sm font-medium text-foreground">
            {shipment.provider}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Tracking
          </p>
          <p className="text-sm font-medium text-foreground">
            {shipment.providerOrderCode ?? shipment.clientOrderCode ?? "Pending"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Expected delivery
          </p>
          <p className="text-sm font-medium text-foreground">
            {shipment.expectedDeliveryAt
              ? new Date(shipment.expectedDeliveryAt).toLocaleString()
              : "Pending"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Last synced
          </p>
          <p className="text-sm font-medium text-foreground">
            {shipment.lastSyncedAt
              ? new Date(shipment.lastSyncedAt).toLocaleString()
              : "Pending"}
          </p>
        </div>
        {shipment.failureReason ? (
          <div className="md:col-span-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Failure reason
            </p>
            <p className="text-sm font-medium text-foreground">
              {shipment.failureReason}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
