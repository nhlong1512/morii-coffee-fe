"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ErrorMessage } from "@/components/ui/error-message";
import { storeFormSchema } from "../schema";
import { buildStoreFormValues, buildUpsertStoreRequest } from "../utils";
import { StoreHoursEditor } from "./store-hours-editor";
import type { StoreFormValues, StoreLocation, UpsertStoreRequest } from "../types";

interface StoreFormProps {
  mode: "create" | "edit";
  initialValue?: StoreLocation | null;
  onSubmit: (payload: UpsertStoreRequest) => Promise<void>;
  onCancel: () => void;
  canEditActive?: boolean;
}

export function StoreForm({
  mode,
  initialValue,
  onSubmit,
  onCancel,
  canEditActive = true,
}: StoreFormProps) {
  const t = useTranslations("adminStores");
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: buildStoreFormValues(initialValue),
  });

  React.useEffect(() => {
    reset(buildStoreFormValues(initialValue));
  }, [initialValue, reset]);

  const openingHours = useWatch({ control, name: "openingHours" });
  const isActive = useWatch({ control, name: "isActive" });

  const submitHandler = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(buildUpsertStoreRequest(values));
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : t("saveFailed"));
    }
  });

  return (
    <form className="space-y-6" onSubmit={submitHandler}>
      {submitError && <ErrorMessage message={submitError} inline={false} />}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.name")}</label>
          <Input {...register("name")} />
          {errors.name?.message && <ErrorMessage message={errors.name.message} />}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.slug")}</label>
          <Input {...register("slug")} />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">{t("form.address")}</label>
        <Textarea {...register("address")} />
        {errors.address?.message && <ErrorMessage message={errors.address.message} />}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.district")}</label>
          <Input {...register("district")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.city")}</label>
          <Input {...register("city")} />
          {errors.city?.message && <ErrorMessage message={errors.city.message} />}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.province")}</label>
          <Input {...register("province")} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.latitude")}</label>
          <Input {...register("latitude")} />
          {errors.latitude?.message && <ErrorMessage message={errors.latitude.message} />}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.longitude")}</label>
          <Input {...register("longitude")} />
          {errors.longitude?.message && <ErrorMessage message={errors.longitude.message} />}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.phone")}</label>
          <Input {...register("phone")} />
          {errors.phone?.message && <ErrorMessage message={errors.phone.message} />}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.email")}</label>
          <Input {...register("email")} />
          {errors.email?.message && <ErrorMessage message={errors.email.message} />}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.coverImageUrl")}</label>
          <Input {...register("coverImageUrl")} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("form.displayOrder")}</label>
          <Input {...register("displayOrder")} />
          {errors.displayOrder?.message && <ErrorMessage message={errors.displayOrder.message} />}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-border p-4">
        <Switch
          checked={isActive}
          disabled={!canEditActive}
          onCheckedChange={(checked) => setValue("isActive", checked)}
        />
        <div>
          <p className="text-sm font-medium text-foreground">{t("form.isActive")}</p>
          <p className="text-xs text-muted-foreground">{t("form.isActiveHint")}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">{t("form.openingHours")}</h2>
          <p className="text-sm text-muted-foreground">{t("form.openingHoursHint")}</p>
        </div>
        <StoreHoursEditor
          value={openingHours}
          onChange={(nextValue) => setValue("openingHours", nextValue, { shouldValidate: true })}
        />
        {errors.openingHours?.message && (
          <ErrorMessage message={errors.openingHours.message} />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("cancel")}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("saving") : mode === "create" ? t("create") : t("save")}
        </Button>
      </div>
    </form>
  );
}
