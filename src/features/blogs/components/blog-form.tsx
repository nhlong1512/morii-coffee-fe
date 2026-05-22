"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ErrorMessage } from "@/components/ui/error-message";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/admin/image-upload";
import type { ApiBlogCategory } from "@/types/api";
import { blogPostSchema, createDefaultBlogPostValues, type BlogPostSchemaValues } from "../schema";
import { generateBlogSlug } from "../utils";
import { BlogEditor } from "./blog-editor";

interface BlogFormProps {
  mode: "create" | "edit";
  categories: ApiBlogCategory[];
  initialValues?: Partial<BlogPostSchemaValues>;
  saving?: boolean;
  error?: string | null;
  cancelHref: string;
  onSubmit: (values: BlogPostSchemaValues) => Promise<void> | void;
}

export function BlogForm({
  mode,
  categories,
  initialValues,
  saving = false,
  error,
  cancelHref,
  onSubmit,
}: BlogFormProps) {
  const t = useTranslations("adminBlog");
  const defaultValues = React.useMemo(
    () => ({
      ...createDefaultBlogPostValues(),
      ...initialValues,
    }),
    [initialValues]
  );

  const {
    control,
    formState: { errors, dirtyFields },
    handleSubmit,
    register,
    setValue,
  } = useForm<BlogPostSchemaValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues,
  });

  const titleValue = useWatch({ control, name: "title" });
  const categoryIds = useWatch({ control, name: "categoryIds" });
  const contentJsonValue = useWatch({ control, name: "contentJson" });
  const slugValue = useWatch({ control, name: "slug" });
  const excerptValue = useWatch({ control, name: "excerpt" });
  const seoTitleValue = useWatch({ control, name: "seoTitle" });
  const seoDescriptionValue = useWatch({ control, name: "seoDescription" });
  const coverImageUrlValue = useWatch({ control, name: "coverImageUrl" });

  React.useEffect(() => {
    if (!titleValue || dirtyFields.slug) return;
    setValue("slug", generateBlogSlug(titleValue), { shouldValidate: true });
  }, [dirtyFields.slug, setValue, titleValue]);

  const toggleCategory = (id: string, checked: boolean) => {
    const next = checked
      ? [...categoryIds, id]
      : categoryIds.filter((existingId) => existingId !== id);

    setValue("categoryIds", next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.content")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label={t("fields.title")}
                name="title"
                value={titleValue}
                onChange={(value) => setValue("title", value, { shouldDirty: true, shouldValidate: true })}
                error={errors.title?.message}
                placeholder={t("placeholders.title")}
                required
              />

              <FormField
                label={t("fields.slug")}
                name="slug"
                value={slugValue}
                onChange={(value) => setValue("slug", value, { shouldDirty: true, shouldValidate: true })}
                error={errors.slug?.message}
                placeholder={t("placeholders.slug")}
                required
              />

              <FormField
                label={t("fields.excerpt")}
                name="excerpt"
                type="textarea"
                value={excerptValue}
                onChange={(value) => setValue("excerpt", value, { shouldDirty: true, shouldValidate: true })}
                error={errors.excerpt?.message}
                placeholder={t("placeholders.excerpt")}
              />

              <div className="space-y-2">
                <Label>{t("fields.content")}</Label>
                <Controller
                  control={control}
                  name="contentHtml"
                  render={({ field }) => (
                    <BlogEditor
                      value={{
                        contentHtml: field.value,
                        contentJson: contentJsonValue,
                      }}
                      onChange={({ contentHtml, contentJson }) => {
                        setValue("contentHtml", contentHtml, { shouldDirty: true, shouldValidate: true });
                        setValue("contentJson", contentJson, { shouldDirty: true });
                      }}
                      error={errors.contentHtml?.message}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("sections.seo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                label={t("fields.seoTitle")}
                name="seoTitle"
                value={seoTitleValue}
                onChange={(value) => setValue("seoTitle", value, { shouldDirty: true, shouldValidate: true })}
                error={errors.seoTitle?.message}
                placeholder={t("placeholders.seoTitle")}
              />

              <FormField
                label={t("fields.seoDescription")}
                name="seoDescription"
                type="textarea"
                value={seoDescriptionValue}
                onChange={(value) => setValue("seoDescription", value, { shouldDirty: true, shouldValidate: true })}
                error={errors.seoDescription?.message}
                placeholder={t("placeholders.seoDescription")}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("sections.publish")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("fields.status")}</Label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">{t("status.draft")}</SelectItem>
                        <SelectItem value="Published">{t("status.published")}</SelectItem>
                        <SelectItem value="Archived">{t("status.archived")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                    <div>
                      <Label htmlFor="isFeatured">{t("fields.featured")}</Label>
                      <p className="text-xs text-muted-foreground">
                        {t("hints.featured")}
                      </p>
                    </div>
                    <Switch
                      id="isFeatured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              <div className="space-y-2">
                <Label htmlFor="displayOrder">{t("fields.displayOrder")}</Label>
                <input
                  id="displayOrder"
                  type="number"
                  min="0"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  {...register("displayOrder", { valueAsNumber: true })}
                />
                {errors.displayOrder?.message ? (
                  <p className="text-sm font-medium text-destructive">
                    {errors.displayOrder.message}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("sections.media")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                value={coverImageUrlValue}
                onChange={(url) => setValue("coverImageUrl", url, { shouldDirty: true })}
                bucketName="blogs"
                onUploaded={(blob) => {
                  setValue("coverImageUrl", blob.uri, { shouldDirty: true });
                  setValue("coverImageFileName", blob.name, { shouldDirty: true });
                }}
                alt={t("fields.coverImage")}
                recommendedSize="1600 x 900"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("sections.categories")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("empty.categories")}</p>
              ) : (
                categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-start gap-3 rounded-md border border-border px-3 py-2"
                  >
                    <Checkbox
                      checked={categoryIds.includes(category.id)}
                      onCheckedChange={(checked) => toggleCategory(category.id, checked === true)}
                    />
                    <div className="space-y-1">
                      <span className="text-sm font-medium">{category.name}</span>
                      {category.description ? (
                        <p className="text-xs text-muted-foreground">{category.description}</p>
                      ) : null}
                    </div>
                  </label>
                ))
              )}

              {errors.categoryIds?.message ? (
                <p className="text-sm font-medium text-destructive">
                  {errors.categoryIds.message}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {error ? <ErrorMessage message={error} inline={false} /> : null}

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" type="button" asChild>
          <Link href={cancelHref}>{t("actions.cancel")}</Link>
        </Button>
        <Button type="submit" disabled={saving}>
          {saving
            ? t("actions.saving")
            : mode === "create"
              ? t("actions.create")
              : t("actions.save")}
        </Button>
      </div>
    </form>
  );
}
