"use client";

import { useTranslations } from "next-intl";
import type { DeliveryInfo } from "@/types";

interface DeliveryFormProps {
  values: DeliveryInfo;
  errors: Partial<Record<keyof DeliveryInfo, string>>;
  onChange: (field: keyof DeliveryInfo, value: string) => void;
}

export function DeliveryForm({ values, errors, onChange }: DeliveryFormProps) {
  const t = useTranslations("checkout");

  const fields: { key: keyof DeliveryInfo; label: string; placeholder: string; type?: string }[] = [
    { key: "fullName", label: t("fullName"), placeholder: t("fullNamePlaceholder") },
    { key: "phoneNumber", label: t("phoneNumber"), placeholder: t("phoneNumberPlaceholder"), type: "tel" },
    { key: "address", label: t("address"), placeholder: t("addressPlaceholder") },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <h2 className="text-lg font-semibold">{t("deliveryTitle")}</h2>

      <div className="space-y-4">
        {fields.map(({ key, label, placeholder, type = "text" }) => (
          <div key={key} className="space-y-1.5">
            <label htmlFor={key} className="block text-sm font-medium text-foreground">
              {label}
            </label>
            <input
              id={key}
              type={type}
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            />
            {errors[key] && (
              <p className="text-xs text-destructive">{errors[key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
