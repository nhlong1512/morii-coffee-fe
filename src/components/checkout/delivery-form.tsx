"use client";

import { useTranslations } from "next-intl";
import type { DeliveryInfo } from "@/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";

interface DeliveryFormProps {
  values: DeliveryInfo;
  errors: Partial<Record<keyof DeliveryInfo, string>>;
  onChange: (field: keyof DeliveryInfo, value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function DeliveryForm({
  values,
  errors,
  onChange,
  disabled = false,
  children,
}: DeliveryFormProps) {
  const t = useTranslations("checkout");

  const fields: { key: keyof DeliveryInfo; label: string; placeholder: string; type?: "text" | "tel" }[] = [
    { key: "fullName", label: t("fullName"), placeholder: t("fullNamePlaceholder") },
    { key: "phoneNumber", label: t("phoneNumber"), placeholder: t("phoneNumberPlaceholder"), type: "tel" },
    { key: "address", label: t("address"), placeholder: t("addressPlaceholder") },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("deliveryTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {fields.map(({ key, label, placeholder, type = "text" }) => (
            <FormField
              key={key}
              name={key as string}
              label={label}
              type={type}
              value={typeof values[key] === "string" ? values[key] : ""}
              error={errors[key]}
              placeholder={placeholder}
              disabled={disabled}
              onChange={(value) => onChange(key, value)}
            />
          ))}
        </div>

        {children}
      </CardContent>
    </Card>
  );
}
