"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { getDayLabel } from "../utils";
import type { StoreFormValues } from "../types";

interface StoreHoursEditorProps {
  value: StoreFormValues["openingHours"];
  onChange: (nextValue: StoreFormValues["openingHours"]) => void;
}

export function StoreHoursEditor({
  value,
  onChange,
}: StoreHoursEditorProps) {
  const t = useTranslations("adminStores");

  const updateHour = (
    index: number,
    field: keyof StoreFormValues["openingHours"][number],
    nextValue: string | boolean
  ) => {
    const nextHours = value.map((hour, hourIndex) =>
      hourIndex === index ? { ...hour, [field]: nextValue } : hour
    );
    onChange(nextHours);
  };

  return (
    <div className="space-y-3">
      {value.map((hour, index) => (
        <div
          key={hour.dayOfWeek}
          className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-[1fr_auto_1fr_1fr]"
        >
          <div>
            <p className="font-medium text-foreground">{t(`days.${getDayLabel(hour.dayOfWeek).toLowerCase()}`)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={hour.isClosed}
              onCheckedChange={(checked) => updateHour(index, "isClosed", checked)}
            />
            <span className="text-sm text-muted-foreground">{t("closed")}</span>
          </div>
          <Input
            type="time"
            value={hour.openTime}
            disabled={hour.isClosed}
            onChange={(event) => updateHour(index, "openTime", event.target.value)}
          />
          <Input
            type="time"
            value={hour.closeTime}
            disabled={hour.isClosed}
            onChange={(event) => updateHour(index, "closeTime", event.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
