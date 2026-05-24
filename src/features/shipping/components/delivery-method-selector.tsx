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
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-accent"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    {t(option.titleKey)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t(option.descriptionKey)}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
