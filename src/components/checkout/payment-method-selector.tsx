"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

const PAYMENT_METHODS: PaymentMethod[] = ["COD", "MOMO", "PAYPAL"];

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const t = useTranslations("checkout");

  const labelKey: Record<PaymentMethod, string> = {
    COD: "cod",
    MOMO: "momo",
    PAYPAL: "paypal",
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h2 className="text-lg font-semibold">{t("paymentTitle")}</h2>

      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors",
              value === method
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-accent"
            )}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method}
              checked={value === method}
              onChange={() => onChange(method)}
              className="accent-primary h-4 w-4 shrink-0"
            />
            <span className="text-sm font-medium">
              {t(labelKey[method] as Parameters<typeof t>[0])}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
