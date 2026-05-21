"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { createBlogPost } from "@/features/blogs/api";
import { BlogForm } from "@/features/blogs/components/blog-form";
import { useAdminBlogCategories } from "@/features/blogs/hooks";
import { generateBlogSlug } from "@/features/blogs/utils";
import { ROUTES } from "@/constants/routes";
import type { BlogPostSchemaValues } from "@/features/blogs/schema";

export default function NewBlogPage() {
  const t = useTranslations("adminBlog");
  const router = useRouter();
  const { data: categories = [], loading, error } = useAdminBlogCategories();
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const handleSubmit = async (values: BlogPostSchemaValues) => {
    setSaving(true);
    setSaveError(null);
    try {
      await createBlogPost({
        ...values,
        slug: values.slug || generateBlogSlug(values.title),
        excerpt: values.excerpt || null,
        seoTitle: values.seoTitle || null,
        seoDescription: values.seoDescription || null,
      });
      toast.success(t("toasts.created"));
      router.push(ROUTES.ADMIN.BLOGS);
    } catch (submitError) {
      setSaveError(
        submitError instanceof Error ? submitError.message : t("errors.generic")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={ROUTES.ADMIN.BLOGS}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("createTitle")}</h1>
          <p className="text-muted-foreground">{t("createSubtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner variant="spinner" size="md" />
        </div>
      ) : error ? (
        <ErrorMessage message={error} inline={false} />
      ) : (
        <BlogForm
          mode="create"
          categories={categories}
          saving={saving}
          error={saveError}
          cancelHref={ROUTES.ADMIN.BLOGS}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
