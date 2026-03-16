"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { cn } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { products } from "@/data/products";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

export function CategoryManager() {
  const [categories, setCategories] = React.useState<string[]>([
    ...PRODUCT_CATEGORIES,
  ]);
  const [newCategory, setNewCategory] = React.useState("");
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [deleteIndex, setDeleteIndex] = React.useState<number | null>(null);

  const getProductCount = (category: string) => {
    return products.filter((p) => p.category === category).length;
  };

  const handleAdd = () => {
    const trimmed = newCategory.trim().toLowerCase();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories([...categories, trimmed]);
    setNewCategory("");
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(categories[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editValue.trim().toLowerCase();
    if (
      !trimmed ||
      categories.some((c, i) => c === trimmed && i !== editingIndex)
    ) {
      return;
    }
    const next = [...categories];
    next[editingIndex] = trimmed;
    setCategories(next);
    setEditingIndex(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleDelete = () => {
    if (deleteIndex === null) return;
    setCategories(categories.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="New category name..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {categories.map((category, index) => (
            <div
              key={category}
              className={cn(
                "flex items-center justify-between rounded-md border border-border px-4 py-3 transition-colors",
                editingIndex === index && "bg-muted/50"
              )}
            >
              {editingIndex === index ? (
                <div className="flex items-center gap-2 flex-1 mr-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveEdit();
                      if (e.key === "Escape") handleCancelEdit();
                    }}
                    className="h-8"
                    autoFocus
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSaveEdit}
                    className="h-8 w-8 shrink-0"
                  >
                    <Check className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 shrink-0"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="font-medium capitalize">{category}</span>
                    <Badge variant="secondary">
                      {getProductCount(category)} product
                      {getProductCount(category) !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(index)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteIndex(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <ConfirmDialog
          open={deleteIndex !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteIndex(null);
          }}
          title="Delete Category"
          description={
            deleteIndex !== null
              ? `Are you sure you want to delete "${categories[deleteIndex]}"? Products in this category will not be deleted.`
              : ""
          }
          onConfirm={handleDelete}
          variant="destructive"
        />
      </CardContent>
    </Card>
  );
}
