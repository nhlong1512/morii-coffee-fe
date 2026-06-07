"use client";

import { Check, Clock, CreditCard, Package, Truck, Home, Star, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/constants";

const STEPS: { status: OrderStatus; icon: React.ElementType; labelKey: string }[] = [
  { status: "PENDING",         icon: Clock,       labelKey: "statusPending" },
  { status: "CONFIRMED",       icon: CreditCard,  labelKey: "statusConfirmed" },
  { status: "READY_TO_PICKUP", icon: Package,     labelKey: "statusReadyToPickup" },
  { status: "IN_DELIVERY",     icon: Truck,       labelKey: "statusInDelivery" },
  { status: "DELIVERED",       icon: Home,        labelKey: "statusDelivered" },
  { status: "REVIEWED",        icon: Star,        labelKey: "statusReviewed" },
];

const STATUS_INDEX: Record<string, number> = {
  PENDING:         0,
  CONFIRMED:       1,
  READY_TO_PICKUP: 2,
  IN_DELIVERY:     3,
  DELIVERED:       4,
  REVIEWED:        5,
};

interface OrderStatusProgressProps {
  status: OrderStatus;
}

export function OrderStatusProgress({ status }: OrderStatusProgressProps) {
  const t = useTranslations("orderDetail");
  const isCancelled = status === "CANCELLED";
  const currentIndex = isCancelled ? -1 : (STATUS_INDEX[status] ?? 0);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 py-4 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <X className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <span className="font-semibold text-red-600 dark:text-red-400">
          {t("statusCancelled")}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full py-2 sm:overflow-x-auto sm:py-4">
      <div className="relative flex min-w-0 flex-col gap-1 sm:min-w-[480px] sm:flex-row sm:items-start sm:justify-between sm:gap-0">
        {/* connecting lines */}
        <div className="absolute left-0 right-0 top-5 hidden px-[calc(50%/6)] sm:flex">
          {STEPS.slice(0, -1).map((_, i) => (
            <div key={i} className="mx-1 h-0.5 flex-1">
              <div
                className={cn(
                  "h-full transition-colors duration-300",
                  i < currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            </div>
          ))}
        </div>

        {STEPS.map((step, i) => {
          const isCompleted = i < currentIndex;
          const isCurrent = i === currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.status}
              className="relative flex min-w-0 items-center gap-3 sm:flex-1 sm:flex-col sm:gap-2"
            >
              {i < STEPS.length - 1 ? (
                <div
                  className={cn(
                    "absolute -bottom-2 left-5 top-8 w-0.5 -translate-x-1/2 sm:hidden",
                    i < currentIndex ? "bg-primary" : "bg-border"
                  )}
                />
              ) : null}
              <div
                className={cn(
                  "z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isCompleted || isCurrent
                    ? "border-primary bg-primary"
                    : "border-border bg-background"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
                ) : (
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                    )}
                  />
                )}
              </div>

              <span
                className={cn(
                  "min-w-0 text-sm font-medium leading-tight sm:px-1 sm:text-center sm:text-xs",
                  isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t(step.labelKey as Parameters<typeof t>[0])}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
