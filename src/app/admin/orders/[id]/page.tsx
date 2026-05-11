"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Printer,
  Package,
  Phone,
  User,
  StickyNote,
  Loader2,
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAdminOrderById } from "@/services/order-service";
import type { ApiOrderDetail } from "@/types/api";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "READY_TO_PICKUP", label: "Ready to Pickup" },
  { value: "IN_DELIVERY", label: "In Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  COD: "Cash on Delivery",
  MOMO: "MoMo",
  PAYPAL: "PayPal",
};

function getStatusVariant(status: string): "success" | "warning" | "info" | "error" | "default" {
  switch (status) {
    case "PENDING": return "warning";
    case "CONFIRMED":
    case "READY_TO_PICKUP":
    case "IN_DELIVERY": return "info";
    case "DELIVERED":
    case "REVIEWED": return "success";
    case "CANCELLED": return "error";
    default: return "default";
  }
}

function getStatusLabel(status: string): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<ApiOrderDetail | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;

    async function load() {
      try {
        const data = await getAdminOrderById(params.id);
        if (!cancelled) setOrder(data);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load order");
          setOrder(null);
        }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [params.id]);

  if (order === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Package className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h2 className="text-xl font-semibold">Order not found</h2>
        <p className="mt-1 text-muted-foreground">
          {error ?? "The order you're looking for doesn't exist."}
        </p>
        <Button asChild className="mt-4">
          <Link href="/admin/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight font-mono">
              {order.orderNumber}
            </h1>
            <Badge variant={getStatusVariant(order.orderStatus)}>
              {getStatusLabel(order.orderStatus)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Placed {formatDate(order.createdAt)}
            {order.updatedAt !== order.createdAt && (
              <> &middot; Updated {formatDate(order.updatedAt)}</>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="hidden sm:flex"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — Items */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border border-border p-3"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variantLabel ? `${item.variantLabel} · ` : ""}
                        Qty: {item.quantity} &middot; {formatVND(item.unitPrice)} each
                      </p>
                    </div>
                    <span className="shrink-0 font-semibold">
                      {formatVND(item.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatVND(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatVND(order.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping === 0 ? "Free" : formatVND(order.shipping)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Discount</span>
                    <span>-{formatVND(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatVND(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  Customer Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">Recipient</p>
                  <p className="text-muted-foreground">{order.deliveryFullName || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{order.deliveryPhoneNumber || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">{order.deliveryAddress || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</span>
              </div>
            </CardContent>
          </Card>

          <AdminStatusUpdate order={order} onUpdated={setOrder} />
        </div>
      </div>
    </div>
  );
}

function AdminStatusUpdate({
  order,
  onUpdated,
}: {
  order: ApiOrderDetail;
  onUpdated: (updated: ApiOrderDetail) => void;
}) {
  const [selected, setSelected] = useState(order.orderStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = selected !== order.orderStatus;

  async function handleUpdate() {
    setSaving(true);
    try {
      // TODO: wire up PUT /api/v1/admin/orders/{id}/status when endpoint is confirmed
      await new Promise((r) => setTimeout(r, 500));
      onUpdated({ ...order, orderStatus: selected });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <Button
          className="w-full"
          onClick={handleUpdate}
          disabled={!isDirty || saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : saved ? (
            "Status Updated!"
          ) : (
            "Update Status"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
