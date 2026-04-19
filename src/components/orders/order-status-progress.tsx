"use client";

import { Check, Package, Truck, Home, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/constants";

const STEPS: { status: OrderStatus; icon: React.ElementType; labelKey: string }[] = [
  { status: "processing", icon: Package, labelKey: "statusProcessing" },
  { status: "in-transit", icon: Truck, labelKey: "statusInTransit" },
  { status: "delivered", icon: Home, labelKey: "statusDelivered" },
];

const STATUS_INDEX: Record<string, number> = {
  processing: 0,
  "in-transit": 1,
  delivered: 2,
};

interface OrderStatusProgressProps {
  status: OrderStatus;
}

export function OrderStatusProgress({ status }: OrderStatusProgressProps) {
  const t = useTranslations("orderDetail");
  const isCancelled = status === "cancelled";
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
    <div className="w-full py-4">
      <div className="relative flex items-start justify-between">
        {/* connecting lines */}
        <div className="absolute top-5 left-0 right-0 flex px-[calc(50%/3)]">
          {STEPS.slice(0, -1).map((_, i) => (
            <div key={i} className="flex-1 h-0.5 mx-1">
              <div
                className={cn(
                  "h-full transition-colors duration-300",
                  i < currentIndex
                    ? "bg-primary"
                    : "bg-border"
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
            <div key={step.status} className="relative flex flex-col items-center gap-2 flex-1">
              {/* circle node */}
              <div
                className={cn(
                  "z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
                  isCompleted
                    ? "bg-primary border-primary"
                    : isCurrent
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
                ) : (
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isCurrent
                        ? "text-primary-foreground"
                        : "text-muted-foreground"
                    )}
                  />
                )}
              </div>

              {/* label */}
              <span
                className={cn(
                  "text-xs font-medium text-center leading-tight",
                  isCompleted || isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground"
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
