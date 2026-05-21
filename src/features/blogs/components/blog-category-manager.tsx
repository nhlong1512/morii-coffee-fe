"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Pencil, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { ApiBlogCategory } from "@/types/api";
import { createBlogCategory, deleteBlogCategory, updateBlogCategory } from "../api";
import { blogCategorySchema, createDefaultBlogCategoryValues } from "../schema";
import { generateBlogSlug } from "../utils";

interface BlogCategoryManagerProps {
  categories: ApiBlogCategory[];
  onRefresh: () => Promise<void>;
}

interface EditableCategoryState {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
  isActive: boolean;
}

export function BlogCategoryManager({
  categories,
  onRefresh,
}: BlogCategoryManagerProps) {
  const t = useTranslations("adminBlog");
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);
  const [editState, setEditState] = React.useState<EditableCategoryState | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ApiBlogCategory | null>(null);
  const [newCategory, setNewCategory] = React.useState(createDefaultBlogCategoryValues());

  const handleCreate = async () => {
    const parsed = blogCategorySchema.safeParse({
      ...newCategory,
      slug: newCategory.slug || generateBlogSlug(newCategory.name),
    });

    if (!parsed.success) {
      setCreateError(parsed.error.issues[0]?.message ?? t("errors.generic"));
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      await createBlogCategory({
        ...parsed.data,
        slug: parsed.data.slug || generateBlogSlug(parsed.data.name),
      });
      setNewCategory(createDefaultBlogCategoryValues());
      await onRefresh();
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : t("errors.generic"));
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async () => {
    if (!editState) return;

    const parsed = blogCategorySchema.safeParse({
      ...editState,
      slug: editState.slug || generateBlogSlug(editState.name),
    });

    if (!parsed.success) {
      return;
    }

    setSavingId(editState.id);
    try {
      await updateBlogCategory(editState.id, {
        ...parsed.data,
        slug: parsed.data.slug || generateBlogSlug(parsed.data.name),
      });
      setEditState(null);
      await onRefresh();
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteBlogCategory(deleteTarget.id);
      await onRefresh();
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("sections.categories")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-dashed border-border p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label={t("fields.categoryName")}
              name="new-category-name"
              value={newCategory.name}
              onChange={(value) =>
                setNewCategory((prev) => ({
                  ...prev,
                  name: value,
                  slug: prev.slug ? prev.slug : generateBlogSlug(value),
                }))
              }
              placeholder={t("placeholders.categoryName")}
            />
            <FormField
              label={t("fields.categorySlug")}
              name="new-category-slug"
              value={newCategory.slug ?? ""}
              onChange={(value) =>
                setNewCategory((prev) => ({ ...prev, slug: value }))
              }
              placeholder={t("placeholders.categorySlug")}
            />
            <FormField
              label={t("fields.categoryDescription")}
              name="new-category-description"
              type="textarea"
              value={newCategory.description ?? ""}
              onChange={(value) =>
                setNewCategory((prev) => ({ ...prev, description: value }))
              }
              placeholder={t("placeholders.categoryDescription")}
              className="md:col-span-2"
            />
          </div>

          {createError ? (
            <p className="mt-3 text-sm text-destructive">{createError}</p>
          ) : null}

          <div className="mt-4 flex items-center justify-end gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t("fields.active")}</span>
              <Switch
                checked={newCategory.isActive}
                onCheckedChange={(checked) =>
                  setNewCategory((prev) => ({ ...prev, isActive: checked }))
                }
              />
            </div>
            <Button type="button" onClick={handleCreate} disabled={creating}>
              {creating ? t("actions.saving") : t("actions.addCategory")}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {categories.map((category) => {
            const isEditing = editState?.id === category.id;
            return (
              <div key={category.id} className="rounded-lg border border-border p-4">
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        label={t("fields.categoryName")}
                        name={`edit-name-${category.id}`}
                        value={editState.name}
                        onChange={(value) =>
                          setEditState((prev) => (prev ? { ...prev, name: value } : prev))
                        }
                      />
                      <FormField
                        label={t("fields.categorySlug")}
                        name={`edit-slug-${category.id}`}
                        value={editState.slug}
                        onChange={(value) =>
                          setEditState((prev) => (prev ? { ...prev, slug: value } : prev))
                        }
                      />
                      <FormField
                        label={t("fields.categoryDescription")}
                        name={`edit-description-${category.id}`}
                        type="textarea"
                        value={editState.description}
                        onChange={(value) =>
                          setEditState((prev) =>
                            prev ? { ...prev, description: value } : prev
                          )
                        }
                        className="md:col-span-2"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{t("fields.active")}</span>
                        <Switch
                          checked={editState.isActive}
                          onCheckedChange={(checked) =>
                            setEditState((prev) =>
                              prev ? { ...prev, isActive: checked } : prev
                            )
                          }
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditState(null)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          {t("actions.cancel")}
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSave}
                          disabled={savingId === category.id}
                        >
                          <Save className="mr-2 h-4 w-4" />
                          {savingId === category.id ? t("actions.saving") : t("actions.save")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{category.name}</p>
                        <span className="text-xs text-muted-foreground">{category.slug}</span>
                      </div>
                      {category.description ? (
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      ) : null}
                      <p className="text-xs text-muted-foreground">
                        {t("fields.displayOrder")}: {category.displayOrder}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("actions.edit")}
                        onClick={() =>
                          setEditState({
                            id: category.id,
                            name: category.name,
                            slug: category.slug,
                            description: category.description ?? "",
                            displayOrder: category.displayOrder,
                            isActive: category.isActive,
                          })
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        aria-label={t("actions.delete")}
                        onClick={() => setDeleteTarget(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <ConfirmDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
          title={t("dialogs.deleteCategoryTitle")}
          description={t("dialogs.deleteCategoryDescription", {
            title: deleteTarget?.name ?? "",
          })}
          onConfirm={handleDelete}
          variant="destructive"
        />
      </CardContent>
    </Card>
  );
}
