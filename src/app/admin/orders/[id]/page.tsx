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
import {
  getAdminOrderById,
  getValidOrderStatuses,
  updateOrderStatus,
} from "@/services/order-service";
import {
  getOrderPaymentSummary,
  reconcileOrderRefund,
  refundOrderPayment,
} from "@/services/payment-service";
import {
  getPaymentStatusVariant,
  isRefundablePaymentStatus,
} from "@/lib/payment";
import type {
  ApiOrderDetail,
  ApiOrderPaymentSummary,
  ApiRefundReconcileResponse,
  ApiRefundResponse,
} from "@/types/api";

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
  STRIPE: "Stripe",
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

function getPaymentStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "Pending":
      return "Pending";
    case "Paid":
      return "Paid";
    case "Failed":
      return "Failed";
    case "Refunded":
      return "Refunded";
    case "PartiallyRefunded":
      return "Partially Refunded";
    case "NotRequired":
      return "Not Required";
    default:
      return "Unavailable";
  }
}

function getRemainingRefundableAmount(paymentSummary: ApiOrderPaymentSummary | null) {
  const succeededPayment = paymentSummary?.payments?.find(
    (payment) => payment.status === "Succeeded"
  );

  if (!succeededPayment) {
    return 0;
  }

  const reservedRefundAmount = (succeededPayment.refunds ?? [])
    .filter((refund) => refund.status !== "Failed")
    .reduce((total, refund) => total + refund.amount, 0);

  return Math.max(succeededPayment.amount - reservedRefundAmount, 0);
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<ApiOrderDetail | null | undefined>(undefined);
  const [paymentSummary, setPaymentSummary] =
    useState<ApiOrderPaymentSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);
  const canIssueRefund = isRefundablePaymentStatus(paymentSummary?.paymentStatus);
  const remainingRefundableAmount = getRemainingRefundableAmount(paymentSummary);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;

    async function load() {
      try {
        const [data, nextPaymentSummary] = await Promise.all([
          getAdminOrderById(params.id),
          getOrderPaymentSummary(params.id).catch((paymentFetchError) => {
            if (!cancelled) {
              setPaymentError(
                paymentFetchError instanceof Error
                  ? paymentFetchError.message
                  : "Failed to load payment summary"
              );
            }
            return null;
          }),
        ]);
        if (!cancelled) {
          setOrder(data);
          setPaymentSummary(nextPaymentSummary);
        }
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

  useEffect(() => {
    if (!canIssueRefund || remainingRefundableAmount <= 0) {
      setRefundAmount("");
      return;
    }

    setRefundAmount(String(remainingRefundableAmount));
  }, [canIssueRefund, remainingRefundableAmount]);

  async function refreshOrderPaymentState(orderId: string) {
    setPaymentError(null);
    try {
      const [nextOrder, nextSummary] = await Promise.all([
        getAdminOrderById(orderId),
        getOrderPaymentSummary(orderId),
      ]);
      setOrder(nextOrder);
      setPaymentSummary(nextSummary);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to refresh payment summary");
    }
  }

  function getRefundSuccessMessage(refund: ApiRefundResponse) {
    if (refund.status === "Succeeded") {
      return "Refund already existed on Stripe and has been synchronized.";
    }

    if (refund.paymentStatus === "Refunded") {
      return "Refund initiated. This order is now fully refunded locally.";
    }

    if (refund.paymentStatus === "PartiallyRefunded") {
      return "Refund initiated. This order is now partially refunded locally.";
    }

    return "Refund initiated and waiting for Stripe confirmation.";
  }

  function getRefundReconcileMessage(
    refund: ApiRefundResponse,
    reconcileResult: ApiRefundReconcileResponse
  ) {
    if (reconcileResult.paymentStatus === "Refunded") {
      return "Refund has been synchronized. This order is now fully refunded.";
    }

    if (reconcileResult.paymentStatus === "PartiallyRefunded") {
      return "Refund has been synchronized. This order is now partially refunded.";
    }

    if (reconcileResult.latestRefundStatus === "Succeeded") {
      return "Refund already existed on Stripe and has been synchronized.";
    }

    return getRefundSuccessMessage(refund);
  }

  async function handleRefund() {
    if (!order) {
      return;
    }

    const normalizedAmount = refundAmount.trim();
    const amountValue = normalizedAmount ? Number(normalizedAmount) : null;

    if (amountValue !== null && (!Number.isFinite(amountValue) || amountValue <= 0)) {
      setPaymentError("Refund amount must be a positive number.");
      return;
    }

    setIsRefunding(true);
    setPaymentError(null);
    setPaymentNotice(null);
    try {
      const refund = await refundOrderPayment(order.id, {
        amount: amountValue ?? undefined,
        reason: refundReason.trim() ? refundReason.trim() : undefined,
      });
      setRefundReason("");
      setPaymentNotice(getRefundSuccessMessage(refund));

      try {
        const reconcileResult = await reconcileOrderRefund(order.id);
        setPaymentSummary((current) => (
          current
            ? {
                ...current,
                paymentStatus: reconcileResult.paymentStatus,
              }
            : current
        ));
        setPaymentNotice(getRefundReconcileMessage(refund, reconcileResult));
      } catch (reconcileError) {
        setPaymentNotice(
          "Refund was created, but the latest payment state could not be synchronized yet."
        );
        setPaymentError(
          reconcileError instanceof Error ? reconcileError.message : null
        );
      }

      await refreshOrderPaymentState(order.id);
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Refund failed");
    } finally {
      setIsRefunding(false);
    }
  }

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
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={getPaymentStatusVariant(paymentSummary?.paymentStatus)}>
                  {getPaymentStatusLabel(paymentSummary?.paymentStatus)}
                </Badge>
              </div>

              {paymentSummary?.payments?.length ? (
                <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="font-medium text-foreground">Payment Attempts</p>
                  {paymentSummary.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="rounded-md border border-border/60 bg-background px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-foreground">{payment.status}</span>
                        <span className="text-muted-foreground">{formatDate(payment.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        Amount: {formatVND(payment.amount)}
                      </p>
                      {payment.failureReason ? (
                        <p className="mt-1 text-destructive">{payment.failureReason}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {paymentSummary?.payments?.some((payment) => payment.refunds?.length) ? (
                <div className="space-y-2 rounded-lg border border-border/70 bg-muted/20 p-3">
                  <p className="font-medium text-foreground">Refund History</p>
                  {paymentSummary.payments.flatMap((payment) => payment.refunds ?? []).map((refund) => (
                    <div
                      key={refund.id}
                      className="rounded-md border border-border/60 bg-background px-3 py-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-foreground">{refund.status}</span>
                        <span className="text-muted-foreground">{formatDate(refund.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground">
                        Amount: {formatVND(refund.amount)}
                      </p>
                      {refund.reason ? (
                        <p className="mt-1 text-muted-foreground">Reason: {refund.reason}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {paymentError ? (
                <p className="text-sm text-destructive">{paymentError}</p>
              ) : null}

              {paymentNotice ? (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {paymentNotice}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Refund Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Leave the amount blank to issue a full refund. Partial refunds are allowed only while there is refundable balance remaining.
              </p>
              <input
                type="number"
                min="0"
                step="1000"
                value={refundAmount}
                onChange={(event) => setRefundAmount(event.target.value)}
                placeholder="Refund amount"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={!canIssueRefund || isRefunding}
              />
              <textarea
                rows={3}
                value={refundReason}
                onChange={(event) => setRefundReason(event.target.value)}
                placeholder="Optional refund reason"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={!canIssueRefund || isRefunding}
              />
              {!canIssueRefund ? (
                <p className="text-sm text-muted-foreground">
                  This payment is already fully refunded, so no further refund can be issued.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Default amount uses the full remaining refundable balance: {formatVND(remainingRefundableAmount)}.
                </p>
              )}
              <Button
                className="w-full"
                onClick={handleRefund}
                disabled={!canIssueRefund || isRefunding}
              >
                {isRefunding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refunding...
                  </>
                ) : (
                  "Issue Refund"
                )}
              </Button>
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
  const [validStatuses, setValidStatuses] = useState<string[]>([]);
  const [loadingStatuses, setLoadingStatuses] = useState(true);
  const [selected, setSelected] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingStatuses(true);

    async function load() {
      try {
        const statuses = await getValidOrderStatuses(order.id);
        if (!cancelled) {
          setValidStatuses(statuses);
          setSelected(statuses[0] ?? "");
        }
      } catch {
        if (!cancelled) setValidStatuses([]);
      } finally {
        if (!cancelled) setLoadingStatuses(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [order.id]);

  async function handleUpdate() {
    if (!selected) return;
    setSaving(true);
    try {
      const nextValidStatuses = await updateOrderStatus(order.id, selected);
      onUpdated({ ...order, orderStatus: selected });
      setValidStatuses(nextValidStatuses);
      setSelected(nextValidStatuses[0] ?? "");
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
        {loadingStatuses ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        ) : validStatuses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No further transitions available for this order.
          </p>
        ) : (
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {validStatuses.map((status) => {
              const label = ORDER_STATUSES.find((s) => s.value === status)?.label ?? status;
              return (
                <option key={status} value={status}>
                  {label}
                </option>
              );
            })}
          </select>
        )}
        <Button
          className="w-full"
          onClick={handleUpdate}
          disabled={loadingStatuses || saving || validStatuses.length === 0}
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
