"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ExternalLink, Package } from "lucide-react";
import { OrderStatusProgress } from "@/components/orders/order-status-progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import type { OrderStatus } from "@/lib/constants";
import { cn, formatVND } from "@/lib/utils";
import {
  getOrderHistory,
} from "@/services/order-service";
import { getOrderPaymentSummary } from "@/services/payment-service";
import {
  getPaymentStatusVariant,
  getPaymentStatusLabelKey,
} from "@/lib/payment";
import type { ApiOrderSummary } from "@/types/api";
import type { PaymentStatus } from "@/types";

const statusStyles: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400",
  READY_TO_PICKUP: "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/10 dark:text-indigo-400",
  IN_DELIVERY: "bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-400",
  DELIVERED: "bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400",
  REVIEWED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-400",
};

function toOrderStatus(status: string): OrderStatus {
  switch (status) {
    case "PENDING":
    case "CONFIRMED":
    case "READY_TO_PICKUP":
    case "IN_DELIVERY":
    case "DELIVERED":
    case "REVIEWED":
    case "CANCELLED":
      return status;
    default:
      return "PENDING";
  }
}

function toStatusLabelKey(
  status: OrderStatus
): "pending" | "confirmed" | "readyToPickup" | "inDelivery" | "delivered" | "reviewed" | "cancelled" {
  switch (status) {
    case "PENDING":
      return "pending";
    case "CONFIRMED":
      return "confirmed";
    case "READY_TO_PICKUP":
      return "readyToPickup";
    case "IN_DELIVERY":
      return "inDelivery";
    case "DELIVERED":
      return "delivered";
    case "REVIEWED":
      return "reviewed";
    case "CANCELLED":
      return "cancelled";
  }
}

interface EnrichedOrder extends ApiOrderSummary {
  paymentStatus: PaymentStatus | null;
}

export default function OrdersPage() {
  const t = useTranslations("orders");
  const { isLoading: authLoading } = useProtectedRoute();
  const [orders, setOrders] = useState<EnrichedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function loadOrders() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getOrderHistory();
        const enrichedOrders = await Promise.all(
          response.items.map(async (order) => {
            try {
              const paymentSummary = await getOrderPaymentSummary(order.id);
              return {
                ...order,
                paymentStatus: paymentSummary?.paymentStatus ?? null,
              };
            } catch {
              return {
                ...order,
                paymentStatus: null,
              };
            }
          })
        );
        if (!cancelled) {
          setOrders(enrichedOrders);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(
            nextError instanceof Error ? nextError.message : t("loadFailed")
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, [authLoading, t]);

  if (authLoading || isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">{t("orderHistory")}</h1>

        {error ? (
          <div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        {orders.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-foreground">
              {t("noOrders")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("noOrdersHint")}</p>
            <Link
              href="/products"
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("browseProducts")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => {
              const orderStatus = toOrderStatus(order.orderStatus);

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("orderNumber")}</p>
                        <p className="text-sm font-semibold text-card-foreground">
                          {order.orderNumber ?? order.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("date")}</p>
                        <p className="text-sm text-card-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("status")}</p>
                        <span
                          className={cn(
                            "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                            statusStyles[orderStatus]
                          )}
                        >
                          {t(toStatusLabelKey(orderStatus))}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("paymentStatus")}</p>
                        <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                          {t(getPaymentStatusLabelKey(order.paymentStatus))}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("total")}</p>
                        <p className="text-sm font-semibold text-card-foreground">
                          {formatVND(order.total)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("items")}</p>
                        <p className="text-sm text-card-foreground">
                          {order.itemCount ?? 0} {t("items")}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                    >
                      {t("viewDetails")}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>

                  <div className="mt-4">
                    <OrderStatusProgress status={orderStatus} />
                  </div>

                  {order.firstProductName ? (
                    <p className="mt-4 text-sm text-muted-foreground">
                      {order.firstProductName}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
