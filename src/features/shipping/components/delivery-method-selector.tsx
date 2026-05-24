"use client";

import { Store, Truck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { DeliveryMethod } from "@/types";

interface DeliveryMethodSelectorProps {
  value: DeliveryMethod;
  onChange: (value: DeliveryMethod) => void;
  disabled?: boolean;
}

const DELIVERY_METHOD_OPTIONS: Array<{
  value: DeliveryMethod;
  icon: typeof Store;
  titleKey: "pickup" | "ghnDelivery";
  descriptionKey: "pickupHint" | "ghnDeliveryHint";
}> = [
  {
    value: "PICKUP",
    icon: Store,
    titleKey: "pickup",
    descriptionKey: "pickupHint",
  },
  {
    value: "GHN_DELIVERY",
    icon: Truck,
    titleKey: "ghnDelivery",
    descriptionKey: "ghnDeliveryHint",
  },
];

export function DeliveryMethodSelector({
  value,
  onChange,
  disabled = false,
}: DeliveryMethodSelectorProps) {
  const t = useTranslations("checkout");

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">
        {t("deliveryMethodTitle")}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        {DELIVERY_METHOD_OPTIONS.map((option) => {
          const Icon = option.icon;

          return (
            <label
              key={option.value}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                value === option.value
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent"
              )}
            >
              <input
                type="radio"
                name="deliveryMethod"
                value={option.value}
                checked={value === option.value}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="accent-primary h-4 w-4 shrink-0"
              />
              <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-full bg-muted text-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {t(option.titleKey)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(option.descriptionKey)}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
