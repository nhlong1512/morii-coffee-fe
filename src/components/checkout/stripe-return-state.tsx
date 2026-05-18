"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { ArrowRight, Loader2, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import {
  canRetryPayment,
  getPaymentStatusLabelKey,
  getPaymentStatusVariant,
  PENDING_STRIPE_ORDER_STORAGE_KEY,
} from "@/lib/payment";
import {
  getOrderById,
} from "@/services/order-service";
import {
  createCheckoutSession,
  reconcileStripePayment,
} from "@/services/payment-service";
import type { Order } from "@/types";

interface StripeReturnStateProps {
  mode: "success" | "cancel";
}

export function StripeReturnState({ mode }: StripeReturnStateProps) {
  const t = useTranslations("checkoutReturn");
  const { isLoading: authLoading } = useProtectedRoute();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const storedOrderId = sessionStorage.getItem(PENDING_STRIPE_ORDER_STORAGE_KEY);
    setOrderId(storedOrderId);

    if (!storedOrderId) {
      setIsLoadingOrder(false);
      return;
    }

    const nextOrderId = storedOrderId;

    let cancelled = false;

    async function loadOrderWithReconcile() {
      setIsLoadingOrder(true);
      setError(null);

      async function fetchOrder() {
        const nextOrder = await getOrderById(nextOrderId);
        if (!nextOrder) {
          throw new Error(t("loadFailed"));
        }
        return nextOrder;
      }

      try {
        if (mode === "success" && sessionId) {
          await reconcileStripePayment({
            orderId: nextOrderId,
            sessionId,
          });
        }

        let nextOrder = await fetchOrder();

        if (mode === "success" && nextOrder.paymentInfo?.paymentStatus === "Pending") {
          for (let attempt = 0; attempt < 5; attempt += 1) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            nextOrder = await fetchOrder();
            if (nextOrder.paymentInfo?.paymentStatus !== "Pending") {
              break;
            }
          }
        }

        if (!cancelled) {
          setOrder(nextOrder);
          if (
            nextOrder.paymentInfo?.paymentStatus === "Paid" ||
            nextOrder.paymentInfo?.paymentStatus === "Refunded" ||
            nextOrder.paymentInfo?.paymentStatus === "NotRequired"
          ) {
            sessionStorage.removeItem(PENDING_STRIPE_ORDER_STORAGE_KEY);
          }
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(
            nextError instanceof Error ? nextError.message : t("loadFailed")
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingOrder(false);
        }
      }
    }

    void loadOrderWithReconcile();

    return () => {
      cancelled = true;
    };
  }, [authLoading, mode, sessionId, t]);

  const paymentStatus = order?.paymentInfo?.paymentStatus;

  const content = useMemo(() => {
    if (mode === "cancel") {
      if (paymentStatus === "Paid") {
        return {
          title: t("cancelPaidTitle"),
          description: t("cancelPaidDescription"),
        };
      }

      return {
        title: t("cancelTitle"),
        description: t("cancelDescription"),
      };
    }

    switch (paymentStatus) {
      case "Paid":
        return {
          title: t("successTitle"),
          description: t("successDescription"),
        };
      case "Pending":
        return {
          title: t("pendingTitle"),
          description: t("pendingDescription"),
        };
      case "Failed":
        return {
          title: t("failedTitle"),
          description: t("failedDescription"),
        };
      default:
        return {
          title: t("returnTitle"),
          description: t("returnDescription"),
        };
    }
  }, [mode, paymentStatus, t]);

  async function handleRetryPayment() {
    if (!orderId) {
      return;
    }

    setIsRetrying(true);
    try {
      sessionStorage.setItem(PENDING_STRIPE_ORDER_STORAGE_KEY, orderId);
      const session = await createCheckoutSession(orderId);
      window.location.assign(session.checkoutUrl);
    } catch (nextError) {
      toast.error(
        nextError instanceof Error ? nextError.message : t("retryFailed")
      );
    } finally {
      setIsRetrying(false);
    }
  }

  if (authLoading || isLoadingOrder) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">{t("missingOrderTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("missingOrderDescription")}</p>
        <Button className="mt-6" onClick={() => router.push("/orders")}>
          {t("goToOrders")}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <Badge variant={getPaymentStatusVariant(paymentStatus)}>
          {t(getPaymentStatusLabelKey(paymentStatus))}
        </Badge>
        <h1 className="mt-6 text-3xl font-bold text-foreground">{content.title}</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{content.description}</p>

        {paymentStatus === "Pending" ? (
          <p className="mt-4 text-sm text-muted-foreground">
            {t("syncingDescription")}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {canRetryPayment("STRIPE", paymentStatus, order?.status) ? (
            <Button variant="outline" onClick={handleRetryPayment} disabled={isRetrying}>
              {isRetrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("retrying")}
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  {t("retryPayment")}
                </>
              )}
            </Button>
          ) : null}

          <Button asChild>
            <Link href={`/orders/${orderId}`}>
              {t("viewOrder")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
