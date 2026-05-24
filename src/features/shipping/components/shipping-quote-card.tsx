"use client";

import { Clock3, RefreshCw, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/utils";
import type { ShippingQuote } from "../types";

interface ShippingQuoteCardProps {
  quote: ShippingQuote | null;
  loading?: boolean;
  error?: string | null;
  quoteInvalidated?: boolean;
  disabled?: boolean;
  onRequestQuote: () => void;
}

export function ShippingQuoteCard({
  quote,
  loading = false,
  error = null,
  quoteInvalidated = false,
  disabled = false,
  onRequestQuote,
}: ShippingQuoteCardProps) {
  const t = useTranslations("checkout");

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {t("quoteTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {quote ? t("quoteReadyHint") : t("quoteHint")}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || loading}
          onClick={onRequestQuote}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {quote ? t("refreshQuote") : t("getQuote")}
        </Button>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {quoteInvalidated ? (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
          {t("quoteInvalidated")}
        </p>
      ) : null}

      {quote ? (
        <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t("selectedService")}
            </p>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {quote.service.displayName}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t("shipping")}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {formatVND(quote.feeBreakdown.totalFee)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t("estimatedDelivery")}
            </p>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock3 className="h-4 w-4 text-primary" />
              <span>
                {quote.estimatedDeliveryAt
                  ? new Date(quote.estimatedDeliveryAt).toLocaleString()
                  : t("estimatedDeliveryUnavailable")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("quoteEmptyState")}</p>
      )}
    </div>
  );
}
