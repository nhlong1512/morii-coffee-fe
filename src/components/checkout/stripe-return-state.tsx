"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { createCheckoutSession, getOrderPaymentSummary } from "@/services/order-service";
import type { ApiOrderPaymentSummary } from "@/types/api";

interface StripeReturnStateProps {
  mode: "success" | "cancel";
}

export function StripeReturnState({ mode }: StripeReturnStateProps) {
  const t = useTranslations("checkoutReturn");
  const { isLoading: authLoading } = useProtectedRoute();
  const router = useRouter();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [summary, setSummary] = useState<ApiOrderPaymentSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    const storedOrderId = sessionStorage.getItem(PENDING_STRIPE_ORDER_STORAGE_KEY);
    setOrderId(storedOrderId);

    if (!storedOrderId) {
      setIsLoadingSummary(false);
      return;
    }

    const nextOrderId = storedOrderId;

    let cancelled = false;

    async function loadSummary() {
      setIsLoadingSummary(true);
      setError(null);
      try {
        const nextSummary = await getOrderPaymentSummary(nextOrderId);
        if (!cancelled) {
          setSummary(nextSummary);
          if (
            nextSummary?.paymentStatus === "Paid" ||
            nextSummary?.paymentStatus === "Refunded" ||
            nextSummary?.paymentStatus === "NotRequired"
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
          setIsLoadingSummary(false);
        }
      }
    }

    void loadSummary();

    return () => {
      cancelled = true;
    };
  }, [authLoading, t]);

  const content = useMemo(() => {
    if (mode === "cancel") {
      if (summary?.paymentStatus === "Paid") {
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

    switch (summary?.paymentStatus) {
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
  }, [mode, summary?.paymentStatus, t]);

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

  if (authLoading || isLoadingSummary) {
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
        <Badge variant={getPaymentStatusVariant(summary?.paymentStatus)}>
          {t(getPaymentStatusLabelKey(summary?.paymentStatus))}
        </Badge>
        <h1 className="mt-6 text-3xl font-bold text-foreground">{content.title}</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{content.description}</p>

        {error ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          {canRetryPayment("STRIPE", summary?.paymentStatus, null) ? (
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
