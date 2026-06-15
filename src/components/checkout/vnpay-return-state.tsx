"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reconcileVnpayPayment } from "@/services/payment-service";
import { useCartStore } from "@/stores/cart-store";
import type { PaymentStatus } from "@/types";

interface PendingHostedCheckout {
  provider: "Vnpay" | "Stripe";
  checkoutDraftId: string;
  providerSessionId: string;
  expiresAtUtc: string;
}

type ReturnState = "loading" | "success" | "failed" | "expired" | "invalid" | "timeout";

export function VnpayReturnState() {
  const t = useTranslations();
  const checkoutT = useTranslations("checkout");
  const router = useRouter();

  const [state, setState] = useState<ReturnState>("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    const startTime = Date.now();
    const MAX_POLL_SECONDS = 300;
    let pollTimeoutId: NodeJS.Timeout | null = null;
    let elapsedIntervalId: NodeJS.Timeout | null = null;
    let isMounted = true;

    const poll = async () => {
      try {
        if (!isMounted) return;

        const elapsed = (Date.now() - startTime) / 1000;
        setElapsedSeconds(Math.floor(elapsed));

        // Stop conditions
        if (elapsed > MAX_POLL_SECONDS) {
          if (isMounted) {
            setState("timeout");
          }
          return;
        }

        // Get pending checkout from sessionStorage
        const pending = sessionStorage.getItem("morii.pendingHostedCheckout");
        if (!pending) {
          if (isMounted) {
            setState("invalid");
          }
          return;
        }

        const checkout: PendingHostedCheckout = JSON.parse(pending);

        // Check expiration
        if (new Date(checkout.expiresAtUtc) < new Date()) {
          if (isMounted) {
            setState("expired");
          }
          return;
        }

        // Query backend
        const response = await reconcileVnpayPayment({
          checkoutDraftId: checkout.checkoutDraftId,
          txnRef: checkout.providerSessionId,
        });

        if (!isMounted) return;

        // Handle responses
        if (response.paymentStatus === "Paid") {
          setOrderId(response.orderId ?? null);
          setOrderNumber(response.orderNumber ?? null);
          setState("success");

          // Clear cart and cleanup
          await clearCart();
          sessionStorage.removeItem("morii.pendingHostedCheckout");

          // Navigate to order after brief delay
          setTimeout(() => {
            if (response.orderId) {
              router.push(`/orders/${response.orderId}`);
            }
          }, 1000);
          return;
        }

        if (response.paymentStatus === "Failed" || response.paymentStatus === "NotRequired") {
          setState("failed");
          setFailureReason(response.failureReason);
          sessionStorage.removeItem("morii.pendingHostedCheckout");
          return;
        }

        // Still pending, schedule next poll (2-3 seconds)
        const delay = 2000 + Math.random() * 1000;
        pollTimeoutId = setTimeout(poll, delay);
      } catch (error) {
        if (!isMounted) return;

        // Retry on network error
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes("fetch") ||
            error.message.includes("network") ||
            error.message.includes("Network"));

        if (isNetworkError) {
          const delay = 2000;
          pollTimeoutId = setTimeout(poll, delay);
        } else {
          setState("failed");
          setFailureReason(error instanceof Error ? error.message : "Unknown error");
        }
      }
    };

    // Start polling immediately
    poll();

    // Update elapsed seconds display
    elapsedIntervalId = setInterval(() => {
      if (isMounted) {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }
    }, 1000);

    return () => {
      isMounted = false;
      if (pollTimeoutId) {
        clearTimeout(pollTimeoutId);
      }
      if (elapsedIntervalId) {
        clearInterval(elapsedIntervalId);
      }
    };
  }, [clearCart, router]);

  const handleRetry = () => {
    router.push("/checkout");
  };

  if (state === "loading") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
          <p className="text-center text-sm text-muted-foreground">
            {checkoutT("vnpay_pending_verification")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{elapsedSeconds}s</p>
        </CardContent>
      </Card>
    );
  }

  if (state === "success") {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="mb-4 h-8 w-8 text-green-600" />
          <h2 className="text-center text-lg font-semibold text-green-900">
            {checkoutT("vnpay_success")}
          </h2>
          {orderNumber && (
            <p className="mt-2 text-sm text-green-700">
              {t("order.number")}: {orderNumber}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (state === "failed") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-5 w-5" />
            {checkoutT("vnpay_failed")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {failureReason && (
            <p className="text-sm text-red-700">
              <strong>Reason:</strong> {failureReason}
            </p>
          )}
          <Button onClick={handleRetry} variant="default" className="w-full">
            {checkoutT("retry")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "expired") {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <Clock className="h-5 w-5" />
            {checkoutT("vnpay_expired")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-yellow-700">
            {checkoutT("payment_expired_message")}
          </p>
          <Button onClick={handleRetry} variant="default" className="w-full">
            {checkoutT("start_new_order")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "timeout") {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-900">
            <Clock className="h-5 w-5" />
            {t("error.reconcile_timeout")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-yellow-700">
            {checkoutT("payment_verification_timeout")}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/orders")} variant="default" className="flex-1">
              {t("order.viewOrders")}
            </Button>
            <Button onClick={handleRetry} variant="outline" className="flex-1">
              {checkoutT("retry")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (state === "invalid") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="h-5 w-5" />
            {checkoutT("vnpay_invalid")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-red-700">
            {checkoutT("invalid_transaction_message")}
          </p>
          <Button onClick={handleRetry} variant="default" className="w-full">
            {checkoutT("start_new_order")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
