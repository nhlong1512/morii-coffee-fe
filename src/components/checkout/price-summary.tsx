"use client";

import { useTranslations } from "next-intl";
import { formatVND } from "@/lib/utils";

interface PriceSummaryProps {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  children?: React.ReactNode;
}

export function PriceSummary({
  subtotal,
  tax,
  shipping,
  discount,
  total,
  children,
}: PriceSummaryProps) {
  const t = useTranslations("cart");

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h2 className="text-lg font-semibold">{t("orderSummary")}</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("subtotal")}</span>
          <span>{formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("tax")}</span>
          <span>{formatVND(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("shipping")}</span>
          <span>{formatVND(shipping)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 dark:text-green-400">
            <span>{t("discount")}</span>
            <span>-{formatVND(discount)}</span>
          </div>
        )}
      </div>

      <div className="border-t border-border pt-3 flex justify-between font-semibold text-base">
        <span>{t("total")}</span>
        <span className="text-primary">{formatVND(total)}</span>
      </div>

      {children}
    </div>
  );
}
