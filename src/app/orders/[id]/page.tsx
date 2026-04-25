"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, Truck, MapPin, Phone, User, CreditCard } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { orders } from "@/data/orders";
import { OrderStatusProgress } from "@/components/orders/order-status-progress";

interface Props {
  params: Promise<{ id: string }>;
}

const PAYMENT_KEY: Record<string, string> = {
  COD: "cod",
  MOMO: "momo",
  PAYPAL: "paypal",
};

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const t = useTranslations("orderDetail");
  const tCart = useTranslations("cart");

  const order = orders.find((o) => o.id === id) ?? null;

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("notFound")}</h1>
        <p className="text-muted-foreground mb-6">{t("notFoundHint")}</p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToOrders")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToOrders")}
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("orderNumber")}: <span className="font-medium text-foreground">{order.orderNumber}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              {t("orderDate")}:{" "}
              <span className="font-medium text-foreground">
                {new Date(order.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Status Progress */}
          <div className="rounded-xl border border-border bg-card p-6">
            <OrderStatusProgress status={order.status} />
            {order.trackingNumber && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted px-4 py-2.5">
                <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">{t("tracking")}:</span>
                <span className="text-sm font-medium text-foreground">{order.trackingNumber}</span>
              </div>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Delivery Info */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="font-semibold text-foreground">{t("deliveryInfo")}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <User className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{order.delivery.fullName}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{order.delivery.phoneNumber}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{order.delivery.address}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-3">
              <h2 className="font-semibold text-foreground">{t("paymentMethod")}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>{t(PAYMENT_KEY[order.paymentMethod] as Parameters<typeof t>[0])}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-semibold text-foreground">{t("items")}</h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 rounded-lg border border-border p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                      {item.size && <span>{item.size}</span>}
                      <span>x{item.quantity}</span>
                      <span>{formatVND(item.price)} / {tCart("each")}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground shrink-0">
                    {formatVND(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-xl border border-border bg-card p-6 space-y-3">
            <h2 className="font-semibold text-foreground">{t("priceBreakdown")}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("subtotal")}</span>
                <span>{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("tax")}</span>
                <span>{formatVND(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("shipping")}</span>
                <span>{formatVND(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>{t("discount")}</span>
                  <span>-{formatVND(order.discount)}</span>
                </div>
              )}
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-semibold">
              <span>{t("total")}</span>
              <span className="text-primary">{formatVND(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
