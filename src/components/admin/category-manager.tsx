"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Pencil, Trash2, Check, X, ImageIcon, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/admin/image-upload";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryRequest,
  type UpdateCategoryRequest,
} from "@/services/categories-service";
import type { ApiCategory } from "@/types/api";

// ---------------------------------------------------------------------------
// Local types
// ---------------------------------------------------------------------------

interface EditState {
  id: string;
  name: string;
  description: string;
  displayOrder: string;
  isActive: boolean;
  iconFile: File | null;
  iconPreview: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CategoryManager() {
  const t = useTranslations("adminCommon");
  const [categories, setCategories] = React.useState<ApiCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Create form
  const [newName, setNewName] = React.useState("");
  const [newDescription, setNewDescription] = React.useState("");
  const [newDisplayOrder, setNewDisplayOrder] = React.useState("0");
  const [newIconFile, setNewIconFile] = React.useState<File | null>(null);
  const [newIconPreview, setNewIconPreview] = React.useState<string | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [createError, setCreateError] = React.useState<string | null>(null);

  // Edit
  const [editState, setEditState] = React.useState<EditState | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [editError, setEditError] = React.useState<string | null>(null);

  // Delete
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // Toggle
  const [togglingId, setTogglingId] = React.useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Fetch
  // ---------------------------------------------------------------------------

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      setError(t("categoriesError"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ---------------------------------------------------------------------------
  // Create
  // ---------------------------------------------------------------------------

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setCreateError(null);
    try {
      const request: CreateCategoryRequest = {
        name,
        description: newDescription.trim() || undefined,
        icon: newIconFile ?? undefined,
        displayOrder:
          newDisplayOrder === "" ? undefined : Number.parseInt(newDisplayOrder, 10),
      };
      await createCategory(request);
      setNewName("");
      setNewDescription("");
      setNewDisplayOrder("0");
      setNewIconFile(null);
      setNewIconPreview(null);
      await fetchCategories();
    } catch {
      setCreateError(t("createCategoryError"));
    } finally {
      setCreating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Edit
  // ---------------------------------------------------------------------------

  const startEdit = (cat: ApiCategory) => {
    setEditState({
      id: cat.id,
      name: cat.name,
      description: cat.description ?? "",
      displayOrder: cat.displayOrder.toString(),
      isActive: cat.isActive,
      iconFile: null,
      iconPreview: null,
    });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditState(null);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editState) return;
    const name = editState.name.trim();
    if (!name) return;
    setSaving(true);
    setEditError(null);
    try {
      const request: UpdateCategoryRequest = {
        name,
        description: editState.description.trim() || undefined,
        icon: editState.iconFile ?? undefined,
        displayOrder:
          editState.displayOrder === ""
            ? undefined
            : Number.parseInt(editState.displayOrder, 10),
        isActive: editState.isActive,
      };
      await updateCategory(editState.id, request);
      setEditState(null);
      await fetchCategories();
    } catch {
      setEditError(t("saveCategoryError"));
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Delete
  // ---------------------------------------------------------------------------

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      await fetchCategories();
    } catch {
      // deletion failed — close dialog and let user retry
    } finally {
      setDeleteId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Toggle active (optimistic)
  // ---------------------------------------------------------------------------

  const handleToggleActive = async (cat: ApiCategory) => {
    if (togglingId) return;
    setTogglingId(cat.id);
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isActive: !c.isActive } : c))
    );
    try {
      await updateCategory(cat.id, {
        name: cat.name,
        description: cat.description || undefined,
        displayOrder: cat.displayOrder,
        isActive: !cat.isActive,
      });
    } catch {
      // Rollback on failure
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: cat.isActive } : c))
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const categoryToDelete = categories.find((c) => c.id === deleteId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* ── Create form ── */}
        <div className="rounded-lg border border-dashed border-border p-4 space-y-3">
          <p className="text-sm font-semibold">{t("addCategory")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("categoryName")}</Label>
              <Input
                placeholder={t("categoryIconPlaceholder")}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("categoryDisplayOrder")}</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={newDisplayOrder}
                onChange={(e) => setNewDisplayOrder(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("categoryDescription")}</Label>
              <Textarea
                placeholder={t("categoryDescriptionPlaceholder")}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>{t("categoryIcon")}</Label>
              <ImageUpload
                value={newIconPreview}
                onChange={setNewIconPreview}
                onFileSelect={setNewIconFile}
                alt="Category icon"
              />
            </div>
          </div>
          {createError && <p className="text-xs text-destructive">{createError}</p>}
          <Button size="sm" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating
              ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              : <Check className="mr-1.5 h-4 w-4" />}
            {t("addCategory")}
          </Button>
        </div>

        {/* ── List ── */}
        {loading && (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("loadingCategories")}
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center py-10 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fetchCategories}>
              {t("retry")}
            </Button>
          </div>
        )}
        {!loading && !error && categories.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("noCategoriesYet")}</p>
        )}
        {!loading && !error && categories.length > 0 && (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={cn(
                  "rounded-md border border-border px-4 py-3 transition-colors",
                  editState?.id === cat.id && "bg-muted/40"
                )}
              >
                {editState?.id === cat.id ? (
                  /* ── Edit form ── */
                  <div className="space-y-3">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{t("categoryName")}</Label>
                        <Input
                          value={editState.name}
                          onChange={(e) =>
                            setEditState({ ...editState, name: e.target.value })
                          }
                          autoFocus
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("categoryDisplayOrder")}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={editState.displayOrder}
                          onChange={(e) =>
                            setEditState({ ...editState, displayOrder: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>{t("categoryDescription")}</Label>
                        <Textarea
                          value={editState.description}
                          onChange={(e) =>
                            setEditState({ ...editState, description: e.target.value })
                          }
                          rows={2}
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2">
                        <Label>{t("categoryIcon")}</Label>
                        <ImageUpload
                          value={editState.iconPreview ?? cat.iconUrl}
                          onChange={(url) => setEditState((prev) => prev ? { ...prev, iconPreview: url } : prev)}
                          onFileSelect={(file) => setEditState((prev) => prev ? { ...prev, iconFile: file } : prev)}
                          alt={editState.name || "Category icon"}
                        />
                        <p className="text-xs text-muted-foreground">
                          {t("leaveBlankIcon")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={editState.isActive}
                          onCheckedChange={(checked) =>
                            setEditState({ ...editState, isActive: checked })
                          }
                        />
                        <Label>{t("activeStatus")}</Label>
                      </div>
                    </div>
                    {editError && <p className="text-xs text-destructive">{editError}</p>}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={saving || !editState.name.trim()}
                      >
                        {saving
                          ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          : <Check className="mr-1.5 h-3.5 w-3.5" />}
                        {t("save")}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        <X className="mr-1.5 h-3.5 w-3.5" /> {t("cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── Display row ── */
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {cat.iconUrl ? (
                        <Image
                          src={cat.iconUrl}
                          alt=""
                          width={32}
                          height={32}
                          className="shrink-0 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted">
                          <ImageIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium capitalize">{cat.name}</p>
                        {cat.description && (
                          <p className="truncate text-xs text-muted-foreground">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={cn(
                          "shrink-0 text-xs",
                          cat.isActive
                            ? "border-green-600/20 bg-green-600/15 text-green-700"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {cat.isActive ? t("activeStatus") : t("inactiveStatus")}
                      </Badge>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Switch
                        checked={cat.isActive}
                        onCheckedChange={() => handleToggleActive(cat)}
                        disabled={togglingId === cat.id}
                        className="scale-75"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => startEdit(cat)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(cat.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <ConfirmDialog
          open={deleteId !== null}
          onOpenChange={(open) => { if (!open) setDeleteId(null); }}
          title={t("deleteCategoryTitle")}
          description={
            categoryToDelete
              ? t("deleteCategoryDescription", { name: categoryToDelete.name })
              : ""
          }
          onConfirm={handleDelete}
          variant="destructive"
        />
      </CardContent>
    </Card>
  );
}
