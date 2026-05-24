"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";
import { OrderStatusProgress } from "@/components/orders/order-status-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ShipmentSummaryCard,
  getDeliveryMethodLabelKey,
  useShipmentSummary,
} from "@/features/shipping";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import {
  getPaymentMethodLabelKey,
  getPaymentStatusLabelKey,
  getPaymentStatusVariant,
} from "@/lib/payment";
import {
  cancelOrder,
  getOrderById,
} from "@/services/order-service";
import { getOrderPaymentSummary } from "@/services/payment-service";
import { formatVND } from "@/lib/utils";
import { getProductImageUrl } from "@/utils/image-url";
import type { Order } from "@/types";
import type { ApiRefundSummary } from "@/types/api";

function getDeliveryFields(order: Order) {
  return [
    {
      key: "fullName",
      icon: User,
      labelKey: "recipientName" as const,
      value: order.delivery.fullName,
    },
    {
      key: "phoneNumber",
      icon: Phone,
      labelKey: "contactPhone" as const,
      value: order.delivery.phoneNumber,
    },
    {
      key: "address",
      icon: MapPin,
      labelKey: "deliveryAddress" as const,
      value: order.delivery.address,
    },
  ];
}

function hasDeliveryDetails(order: Order) {
  return Boolean(
    order.delivery.fullName || order.delivery.phoneNumber || order.delivery.address
  );
}

function canCancelOrder(order: Order) {
  return order.status === "PENDING";
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations("orderDetail");
  const tCart = useTranslations("cart");
  const { isLoading: authLoading } = useProtectedRoute();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [refunds, setRefunds] = useState<ApiRefundSummary[]>([]);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const {
    shipment,
    loading: isLoadingShipment,
  } = useShipmentSummary(
    params.id && order?.deliveryMethod === "GHN_DELIVERY" ? params.id : null
  );

  useEffect(() => {
    if (authLoading || !params.id) {
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      setError(null);
      try {
        const nextOrder = await getOrderById(params.id);
        if (!cancelled) {
          setOrder(nextOrder);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(
            nextError instanceof Error ? nextError.message : t("loadFailed")
          );
          setOrder(null);
        }
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [authLoading, params.id, t]);

  useEffect(() => {
    if (authLoading || !params.id) {
      return;
    }

    let cancelled = false;

    async function loadRefunds() {
      try {
        const paymentSummary = await getOrderPaymentSummary(params.id);
        if (!cancelled && paymentSummary?.payments) {
          const allRefunds = paymentSummary.payments.flatMap((p) => p.refunds ?? []);
          setRefunds(allRefunds);
        }
      } catch {
        // Silently fail — refund history is optional
        setRefunds([]);
      }
    }

    void loadRefunds();

    return () => {
      cancelled = true;
    };
  }, [authLoading, params.id]);

  if (authLoading || order === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <Package className="mb-4 h-16 w-16 text-muted-foreground/40" />
        <h1 className="mb-2 text-2xl font-bold text-foreground">{t("notFound")}</h1>
        <p className="mb-6 text-muted-foreground">
          {error ?? t("notFoundHint")}
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToOrders")}
        </Link>
      </div>
    );
  }

  const currentOrder = order;
  const paymentInfo = currentOrder.paymentInfo;
  const currentShipment = shipment ?? currentOrder.shipment;

  async function handleCancelOrder() {
    setIsCancelling(true);
    try {
      await cancelOrder(currentOrder.id);
      setOrder((current) => (
        current
          ? {
              ...current,
              status: "CANCELLED",
            }
          : current
      ));
      setIsCancelDialogOpen(false);
      toast.success(t("cancelSuccess"));
    } catch (nextError) {
      toast.error(
        nextError instanceof Error ? nextError.message : t("cancelFailed")
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToOrders")}
        </Link>

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("orderNumber")}:{" "}
            <span className="font-medium text-foreground">{order.orderNumber}</span>
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

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_360px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <OrderStatusProgress status={order.status} />
              {order.trackingNumber ? (
                <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted px-4 py-2.5">
                  <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t("tracking")}:</span>
                  <span className="text-sm font-medium text-foreground">
                    {order.trackingNumber}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="font-semibold text-foreground">{t("items")}</h2>
              <div className="mt-4 space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.variantId ?? "base"}-${index}`}
                    className="flex items-center gap-4 rounded-lg border border-border p-3"
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image
                        src={getProductImageUrl(item.image)}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {item.size ? <span>{item.size}</span> : null}
                        <span>x{item.quantity}</span>
                        <span>
                          {formatVND(item.price)} / {tCart("each")}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 font-semibold text-foreground">
                      {formatVND(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold text-foreground">{t("deliveryInfo")}</h2>
                <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    {t("deliveryMethod")}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {t(getDeliveryMethodLabelKey(order.deliveryMethod))}
                  </p>
                </div>
                {hasDeliveryDetails(order) ? (
                  <div className="mt-4 space-y-3">
                    {getDeliveryFields(order).map((field) => {
                      const Icon = field.icon;

                      return (
                        <div
                          key={field.key}
                          className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/30 px-4 py-3"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-sm">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                              {t(field.labelKey)}
                            </p>
                            <p className="mt-1 break-words text-sm font-medium text-foreground">
                              {field.value || t("unavailableValue")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {t("deliveryUnavailableTitle")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {t("deliveryUnavailableHint")}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3 rounded-xl border border-border bg-card p-6">
                <h2 className="font-semibold text-foreground">{t("paymentMethod")}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4 shrink-0" />
                  <span>{t(getPaymentMethodLabelKey(order.paymentMethod))}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">{t("paymentStatus")}</span>
                  <Badge variant={getPaymentStatusVariant(paymentInfo?.paymentStatus)}>
                    {t(getPaymentStatusLabelKey(paymentInfo?.paymentStatus))}
                  </Badge>
                </div>

                {paymentInfo?.attemptCount ? (
                  <div className="rounded-lg border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {t("paymentAttempts", {
                        count: paymentInfo.attemptCount,
                      })}
                    </p>
                    {paymentInfo.latestAttemptStatus ? (
                      <p className="mt-1">
                        {t("latestPaymentAttempt")}{" "}
                        <span className="font-medium text-foreground">
                          {paymentInfo.latestAttemptStatus}
                        </span>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {paymentInfo?.failureReason ? (
                  <p className="text-sm text-destructive">{paymentInfo.failureReason}</p>
                ) : null}

                {paymentInfo?.paymentStatus === "Pending" ? (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                    <div className="flex items-start gap-2">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>{t("paymentPendingHint")}</p>
                    </div>
                  </div>
                ) : null}

                {refunds.length > 0 ? (
                  <div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t("refundHistory")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("refundHistoryHint")}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {refunds.map((refund) => (
                        <div
                          key={refund.id}
                          className="flex items-start justify-between rounded-lg bg-background px-3 py-2.5 text-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {formatVND(refund.amount)}
                              </span>
                              <Badge
                                variant={
                                  refund.status === "Succeeded" ? "success" :
                                  refund.status === "Pending" ? "warning" :
                                  "error"
                                }
                              >
                                {refund.status}
                              </Badge>
                            </div>
                            {refund.reason ? (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {refund.reason}
                              </p>
                            ) : null}
                          </div>
                          <div className="shrink-0 text-right text-xs text-muted-foreground">
                            {new Date(refund.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="h-fit rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold text-foreground">{t("priceBreakdown")}</h2>
            <div className="mt-4 space-y-2 text-sm">
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
              {order.discount > 0 ? (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>{t("discount")}</span>
                  <span>-{formatVND(order.discount)}</span>
                </div>
              ) : null}
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
              <span>{t("total")}</span>
              <span className="text-primary">{formatVND(order.total)}</span>
            </div>

            <div className="mt-6 border-t border-border pt-4">
              {canCancelOrder(order) ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t("cancelHint")}
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    className="w-full"
                    onClick={() => setIsCancelDialogOpen(true)}
                    disabled={isCancelling}
                  >
                    {isCancelling ? (
                      <>
                        <Loader2 className="animate-spin" />
                        {t("cancelling")}
                      </>
                    ) : (
                      t("cancelOrder")
                    )}
                  </Button>
                </div>
              ) : order.status === "CANCELLED" ? (
                <p className="text-sm text-muted-foreground">
                  {t("alreadyCancelled")}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("cannotCancel")}
                </p>
                )}
              </div>
            </div>

            {order.deliveryMethod === "GHN_DELIVERY" ? (
              isLoadingShipment && !currentShipment ? (
                <div className="rounded-xl border border-border bg-card p-6">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <ShipmentSummaryCard
                  title={t("shipmentTitle")}
                  emptyTitle={t("shipmentPendingTitle")}
                  emptyDescription={t("shipmentPendingDescription")}
                  shipment={currentShipment}
                />
              )
            ) : null}
        </div>
      </div>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("cancelDialogTitle")}</DialogTitle>
            <DialogDescription>{t("cancelDialogDescription")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
              disabled={isCancelling}
            >
              {t("keepOrder")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelOrder}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="animate-spin" />
                  {t("cancelling")}
                </>
              ) : (
                t("confirmCancel")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
