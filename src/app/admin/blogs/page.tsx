"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteBlogPost,
  reorderBlogCategories,
  reorderBlogPosts,
  updateBlogPostStatus,
} from "@/features/blogs/api";
import { useAdminBlogCategories, useAdminBlogPosts } from "@/features/blogs/hooks";
import { BlogCategoryManager } from "@/features/blogs/components/blog-category-manager";
import { BlogListTable } from "@/features/blogs/components/blog-list-table";
import { BlogSortManager } from "@/features/blogs/components/blog-sort-manager";
import type { ApiBlogPostSummary, BlogPostStatus } from "@/types/api";
import { ROUTES } from "@/constants/routes";

export default function AdminBlogsPage() {
  const t = useTranslations("adminBlog");
  const [statusFilter, setStatusFilter] = React.useState<BlogPostStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [deleteTarget, setDeleteTarget] = React.useState<ApiBlogPostSummary | null>(null);

  const {
    data: posts = [],
    loading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useAdminBlogPosts({ takeAll: true, status: statusFilter });
  const {
    data: categories = [],
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useAdminBlogCategories();

  const filteredPosts = React.useMemo(() => {
    if (categoryFilter === "all") return posts;
    return posts.filter((post) =>
      post.categories.some((category) => category.id === categoryFilter)
    );
  }, [categoryFilter, posts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteBlogPost(deleteTarget.id);
      toast.success(t("toasts.deleted"));
      await refetchPosts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.generic"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleStatusChange = async (
    post: ApiBlogPostSummary,
    status: BlogPostStatus
  ) => {
    try {
      await updateBlogPostStatus(post.id, { status });
      toast.success(t("toasts.statusUpdated"));
      await refetchPosts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("errors.generic"));
    }
  };

  const handleSavePostOrder = async (
    items: Array<{ id: string; name: string; displayOrder: number }>
  ) => {
    await reorderBlogPosts({
      items: items.map((item) => ({
        id: item.id,
        displayOrder: item.displayOrder,
      })),
    });
    toast.success(t("toasts.orderSaved"));
    await refetchPosts();
  };

  const handleSaveCategoryOrder = async (
    items: Array<{ id: string; name: string; displayOrder: number }>
  ) => {
    await reorderBlogCategories({
      items: items.map((item) => ({
        id: item.id,
        displayOrder: item.displayOrder,
      })),
    });
    toast.success(t("toasts.orderSaved"));
    await refetchCategories();
  };

  const isLoading = postsLoading || categoriesLoading;
  const hasError = postsError || categoriesError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        <Button asChild>
          <Link href={ROUTES.ADMIN.BLOGS_NEW}>
            <Plus className="mr-2 h-4 w-4" />
            {t("actions.addPost")}
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="posts">
        <TabsList className="flex h-auto flex-wrap justify-start gap-2">
          <TabsTrigger value="posts">{t("tabs.posts")}</TabsTrigger>
          <TabsTrigger value="categories">{t("tabs.categories")}</TabsTrigger>
          <TabsTrigger value="ordering">{t("tabs.ordering")}</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardContent className="grid gap-4 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="blog-status-filter" className="text-sm font-medium">
                  {t("filters.status")}
                </label>
                <select
                  id="blog-status-filter"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as BlogPostStatus | "all")
                  }
                >
                  <option value="all">{t("filters.allStatuses")}</option>
                  <option value="Draft">{t("status.draft")}</option>
                  <option value="Published">{t("status.published")}</option>
                  <option value="Archived">{t("status.archived")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="blog-category-filter" className="text-sm font-medium">
                  {t("filters.category")}
                </label>
                <select
                  id="blog-category-filter"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <option value="all">{t("filters.allCategories")}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner variant="spinner" size="md" />
            </div>
          ) : hasError ? (
            <div className="space-y-4 py-10">
              <ErrorMessage
                message={hasError}
                inline={false}
              />
              <Button variant="outline" onClick={() => Promise.all([refetchPosts(), refetchCategories()])}>
                {t("actions.retry")}
              </Button>
            </div>
          ) : filteredPosts.length === 0 ? (
            <EmptyState
              title={t("empty.postsTitle")}
              description={t("empty.postsDescription")}
            />
          ) : (
            <BlogListTable
              posts={filteredPosts}
              onDelete={setDeleteTarget}
              onStatusChange={handleStatusChange}
              editHref={ROUTES.ADMIN.BLOGS_EDIT}
            />
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <BlogCategoryManager
            categories={categories}
            onRefresh={refetchCategories}
          />
        </TabsContent>

        <TabsContent value="ordering" className="space-y-4">
          <BlogSortManager
            title={t("ordering.postsTitle")}
            items={posts
              .filter((post) => post.status === "Published")
              .map((post) => ({
                id: post.id,
                name: post.title,
                displayOrder: post.displayOrder,
              }))}
            onSave={handleSavePostOrder}
          />

          <BlogSortManager
            title={t("ordering.categoriesTitle")}
            items={categories.map((category) => ({
              id: category.id,
              name: category.name,
              displayOrder: category.displayOrder,
            }))}
            onSave={handleSaveCategoryOrder}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={t("dialogs.deletePostTitle")}
        description={t("dialogs.deletePostDescription", {
          title: deleteTarget?.title ?? "",
        })}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
