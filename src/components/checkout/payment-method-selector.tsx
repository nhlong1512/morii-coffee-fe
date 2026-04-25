"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

const PAYMENT_METHODS: {
  id: PaymentMethod;
  labelKey: string;
  icon: string;
  iconWidth: number;
  iconHeight: number;
}[] = [
  { id: "COD", labelKey: "cod", icon: "/images/cod.svg", iconWidth: 29, iconHeight: 28 },
  { id: "MOMO", labelKey: "momo", icon: "/images/momo.png", iconWidth: 32, iconHeight: 32 },
  { id: "PAYPAL", labelKey: "paypal", icon: "/images/paypal.svg", iconWidth: 25, iconHeight: 30 },
];

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({ value, onChange }: PaymentMethodSelectorProps) {
  const t = useTranslations("checkout");

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h2 className="text-lg font-semibold">{t("paymentTitle")}</h2>

      <div className="space-y-2">
        {PAYMENT_METHODS.map((method) => (
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
              onChange={() => onChange(method.id)}
              className="accent-primary h-4 w-4 shrink-0"
            />
            <div className="flex h-8 w-8 items-center justify-center shrink-0">
              <Image
                src={method.icon}
                alt={method.id}
                width={method.iconWidth}
                height={method.iconHeight}
                className="object-contain"
              />
            </div>
            <span className="text-sm font-medium">
              {t(method.labelKey as Parameters<typeof t>[0])}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
