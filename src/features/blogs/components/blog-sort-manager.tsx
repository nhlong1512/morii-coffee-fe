"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ArrowUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SortableEntityItem } from "../types";

interface BlogSortManagerProps {
  title: string;
  items: SortableEntityItem[];
  onSave: (items: SortableEntityItem[]) => Promise<void>;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function BlogSortManager({
  title,
  items,
  onSave,
}: BlogSortManagerProps) {
  const t = useTranslations("adminBlog");
  const [orderedItems, setOrderedItems] = React.useState<SortableEntityItem[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setOrderedItems(
      [...items].sort((left, right) => left.displayOrder - right.displayOrder)
    );
  }, [items]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(
        orderedItems.map((item, index) => ({
          ...item,
          displayOrder: index,
        }))
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {orderedItems.map((item, index) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-md border border-border px-3 py-2"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {t("fields.displayOrder")}: {index}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`${t("actions.moveUp")} ${item.name}`}
                onClick={() =>
                  setOrderedItems((prev) => moveItem(prev, index, Math.max(index - 1, 0)))
                }
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`${t("actions.moveDown")} ${item.name}`}
                onClick={() =>
                  setOrderedItems((prev) =>
                    moveItem(prev, index, Math.min(index + 1, prev.length - 1))
                  )
                }
                disabled={index === orderedItems.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button type="button" onClick={handleSave} disabled={saving || orderedItems.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? t("actions.saving") : t("actions.saveOrder")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
