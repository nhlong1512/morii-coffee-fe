"use client";

import { useTranslations } from "next-intl";
import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";
import { getPaymentMethodLabelKey } from "@/lib/payment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  icon: typeof Banknote;
}[] = [
  { id: "COD", icon: Banknote },
  { id: "STRIPE", icon: CreditCard },
  { id: "VNPAY", icon: CreditCard },
];

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const t = useTranslations("checkout");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("paymentTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => (
            (() => {
              const Icon = method.icon;

              return (
                <label
                  key={method.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors",
                    value === method.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={value === method.id}
                    disabled={disabled}
                    onChange={() => onChange(method.id)}
                    className="accent-primary h-4 w-4 shrink-0"
                  />
                  <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-full bg-muted text-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">
                    {t(getPaymentMethodLabelKey(method.id))}
                  </span>
                </label>
              );
            })()
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
