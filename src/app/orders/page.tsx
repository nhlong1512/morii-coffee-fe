"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Package, ChevronDown, ChevronUp, Truck, ExternalLink } from "lucide-react";
import { cn, formatVND } from "@/lib/utils";
import { orders } from "@/data/orders";
import { OrderStatusProgress } from "@/components/orders/order-status-progress";

const statusStyles: Record<string, string> = {
  delivered: "bg-green-100 text-green-800 dark:bg-green-400/10 dark:text-green-400",
  "in-transit": "bg-blue-100 text-blue-800 dark:bg-blue-400/10 dark:text-blue-400",
  processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-400/10 dark:text-yellow-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-400/10 dark:text-red-400",
};

const sortedOrders = [...orders].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
);

export default function OrdersPage() {
  const t = useTranslations("orders");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const toggleOrder = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered": return t("delivered");
      case "in-transit": return t("inTransit");
      case "processing": return t("processing");
      case "cancelled": return t("cancelled");
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground">{t("orderHistory")}</h1>

        {sortedOrders.length === 0 ? (
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
              className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("browseProducts")}
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {sortedOrders.map((order) => {
              const isExpanded = expandedOrder === order.id;
              const itemCount = order.items.reduce((acc, item) => acc + item.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  {/* Order Header */}
                  <button
                    onClick={() => toggleOrder(order.id)}
                    className="flex w-full items-center justify-between p-5 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("orderNumber")}</p>
                        <p className="text-sm font-semibold text-card-foreground">
                          {order.orderNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("date")}</p>
                        <p className="text-sm text-card-foreground">
                          {new Date(order.date).toLocaleDateString("en-US", {
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
                            statusStyles[order.status]
                          )}
                        >
                          {getStatusLabel(order.status)}
                        </span>
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
                          {itemCount} {t("items")}
                        </p>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground ml-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground ml-2" />
                    )}
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border px-5 pb-5 pt-4 space-y-4">
                      {/* Status Progress */}
                      <OrderStatusProgress status={order.status} />

                      {/* Tracking Number */}
                      {order.trackingNumber && (
                        <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2.5">
                          <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {t("trackingNumber")}:
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {order.trackingNumber}
                          </span>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="space-y-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 rounded-lg border border-border p-3"
                          >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-card-foreground truncate">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                {item.size && <span>{item.size}</span>}
                                <span>x{item.quantity}</span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-card-foreground">
                              {formatVND(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* View Details Link */}
                      <div className="flex justify-end pt-1">
                        <Link
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                        >
                          {t("viewDetails")}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
