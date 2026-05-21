"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowRight, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useProtectedRoute } from "@/hooks/use-protected-route";
import {
  getPaymentStatusLabelKey,
  getPaymentStatusVariant,
  PENDING_STRIPE_CHECKOUT_DRAFT_STORAGE_KEY,
} from "@/lib/payment";
import { getOrderById } from "@/services/order-service";
import { reconcileStripePayment } from "@/services/payment-service";
import { useCartStore } from "@/stores/cart-store";
import type { Order, PaymentStatus } from "@/types";

interface StripeReturnStateProps {
  mode: "success" | "cancel";
}

const POLL_INTERVAL_MS = 2000;
const MAX_RECONCILE_ATTEMPTS = 5;

function shouldRetryFromCheckout(mode: StripeReturnStateProps["mode"], paymentStatus: PaymentStatus | null) {
  return mode === "cancel" || paymentStatus === "Failed";
}

export function StripeReturnState({ mode }: StripeReturnStateProps) {
  const t = useTranslations("checkoutReturn");
  const { isLoading: authLoading } = useProtectedRoute();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((state) => state.clearCart);

  const [checkoutDraftId, setCheckoutDraftId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingState, setIsLoadingState] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const storedDraftId = sessionStorage.getItem(
      PENDING_STRIPE_CHECKOUT_DRAFT_STORAGE_KEY
    );
    setCheckoutDraftId(storedDraftId);

    if (mode === "cancel") {
      sessionStorage.removeItem(PENDING_STRIPE_CHECKOUT_DRAFT_STORAGE_KEY);
      setIsLoadingState(false);
      return;
    }

    if (!storedDraftId) {
      setIsLoadingState(false);
      return;
    }

    const draftId = storedDraftId;

    if (!sessionId) {
      setError(t("missingSessionDescription"));
      setIsLoadingState(false);
      return;
    }

    const currentSessionId = sessionId;

    let cancelled = false;

    async function loadReconciledOrder() {
      setIsLoadingState(true);
      setError(null);

      try {
        let reconcileResult = await reconcileStripePayment({
          sessionId: currentSessionId,
          checkoutDraftId: draftId,
        });

        for (
          let attempt = 0;
          attempt < MAX_RECONCILE_ATTEMPTS &&
          reconcileResult.paymentStatus === "Pending" &&
          !reconcileResult.orderId;
          attempt += 1
        ) {
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
          reconcileResult = await reconcileStripePayment({
            sessionId: currentSessionId,
            checkoutDraftId: draftId,
          });
        }

        if (cancelled) {
          return;
        }

        setPaymentStatus(reconcileResult.paymentStatus);
        setOrderId(reconcileResult.orderId);

        if (reconcileResult.failureReason) {
          setError(reconcileResult.failureReason);
        }

        if (reconcileResult.orderId) {
          const nextOrder = await getOrderById(reconcileResult.orderId);
          if (!cancelled) {
            setOrder(nextOrder);
            setPaymentStatus(
              nextOrder?.paymentInfo?.paymentStatus ?? reconcileResult.paymentStatus
            );
          }
        }

        if (
          reconcileResult.paymentStatus === "Paid" &&
          reconcileResult.orderId
        ) {
          await clearCart();
        }

        if (reconcileResult.paymentStatus === "Failed") {
          sessionStorage.removeItem(PENDING_STRIPE_CHECKOUT_DRAFT_STORAGE_KEY);
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(
            nextError instanceof Error ? nextError.message : t("loadFailed")
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingState(false);
        }
      }
    }

    void loadReconciledOrder();

    return () => {
      cancelled = true;
    };
  }, [authLoading, clearCart, mode, sessionId, t]);

  const content = useMemo(() => {
    if (mode === "cancel") {
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

  if (authLoading || isLoadingState) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <LoadingSpinner variant="logo" size="md" />
      </div>
    );
  }

  if (!checkoutDraftId && mode === "success") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          {t("missingDraftTitle")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {t("missingDraftDescription")}
        </p>
        <Button className="mt-6" onClick={() => router.push("/checkout")}>
          {t("goToCheckout")}
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
          {shouldRetryFromCheckout(mode, paymentStatus) ? (
            <Button variant="outline" onClick={() => router.push("/checkout")}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {t("retryPayment")}
            </Button>
          ) : null}

          {orderId ? (
            <Button asChild>
              <Link href={`/orders/${orderId}`}>
                {t("viewOrder")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/cart">
                {t("goToCart")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {order?.status === "PENDING" && paymentStatus === "Paid" ? (
          <p className="mt-6 text-sm text-muted-foreground">
            {t("awaitingShopConfirmation")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
