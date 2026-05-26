"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { ArrowLeft, Archive, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  deleteBlogPost,
  updateBlogPost,
  updateBlogPostStatus,
} from "@/features/blogs/api";
import { BlogForm } from "@/features/blogs/components/blog-form";
import { useAdminBlogCategories, useAdminBlogPost } from "@/features/blogs/hooks";
import { generateBlogSlug } from "@/features/blogs/utils";
import { ROUTES } from "@/constants/routes";
import type { BlogPostSchemaValues } from "@/features/blogs/schema";

export default function EditBlogPage() {
  const params = useParams();
  const t = useTranslations("adminBlog");
  const router = useRouter();
  const id = params.id as string;
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const {
    data: post,
    loading: postLoading,
    error: postError,
    refetch: refetchPost,
  } = useAdminBlogPost(id);
  const {
    data: categories = [],
    loading: categoriesLoading,
    error: categoriesError,
  } = useAdminBlogCategories();

  const handleSubmit = async (values: BlogPostSchemaValues) => {
    setSaving(true);
    setSaveError(null);
    try {
      await updateBlogPost(id, {
        ...values,
        slug: values.slug || generateBlogSlug(values.title),
        excerpt: values.excerpt || null,
        seoTitle: values.seoTitle || null,
        seoDescription: values.seoDescription || null,
      });
      toast.success(t("toasts.saved"));
      await refetchPost();
    } catch (submitError) {
      setSaveError(
        submitError instanceof Error ? submitError.message : t("errors.generic")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    try {
      await updateBlogPostStatus(id, { status: "Archived" });
      toast.success(t("toasts.archived"));
      await refetchPost();
    } catch (archiveError) {
      toast.error(
        archiveError instanceof Error ? archiveError.message : t("errors.generic")
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteBlogPost(id);
      toast.success(t("toasts.deleted"));
      router.push(ROUTES.ADMIN.BLOGS);
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error ? deleteError.message : t("errors.generic")
      );
    }
  };

  const loading = postLoading || categoriesLoading;
  const error = postError || categoriesError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Button variant="ghost" size="icon" asChild>
            <Link href={ROUTES.ADMIN.BLOGS}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("editTitle")}</h1>
            <p className="text-muted-foreground">{post?.title ?? t("editSubtitle")}</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleArchive}
            disabled={!post || post.status === "Archived"}
          >
            <Archive className="mr-2 h-4 w-4" />
            {t("actions.archive")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={!post}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("actions.delete")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner variant="spinner" size="md" />
        </div>
      ) : error || !post ? (
        <ErrorMessage
          message={error ?? t("errors.notFound")}
          inline={false}
        />
      ) : (
        <BlogForm
          mode="edit"
          categories={categories}
          initialValues={{
            ...post,
            excerpt: post.excerpt ?? "",
            contentJson: post.contentJson ?? "",
            seoTitle: post.seoTitle ?? "",
            seoDescription: post.seoDescription ?? "",
            categoryIds: post.categories.map((category) => category.id),
          }}
          saving={saving}
          error={saveError}
          cancelHref={ROUTES.ADMIN.BLOGS}
          onSubmit={handleSubmit}
        />
      )}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={t("dialogs.deletePostTitle")}
        description={t("dialogs.deletePostDescription", {
          title: post?.title ?? "",
        })}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
