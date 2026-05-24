"use client";

import { useTranslations } from "next-intl";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ApiCategory } from "@/types/api";

interface CategorySelectorProps {
  categoryList: ApiCategory[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  loading?: boolean;
}

export function CategorySelector({
  categoryList,
  selectedIds,
  onToggle,
  loading,
}: CategorySelectorProps) {
  const t = useTranslations("adminProducts");

  return (
    <div className="space-y-2">
      <Label>{t("categoryLabel")}</Label>
      <div className="space-y-2 rounded-md border border-input p-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">{t("loadingCategories")}</p>
        ) : categoryList.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noCategoriesAvailable")}</p>
        ) : (
          categoryList.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedIds.includes(cat.id)}
                onCheckedChange={() => onToggle(cat.id)}
              />
              <Label htmlFor={`cat-${cat.id}`} className="font-normal cursor-pointer">
                {cat.name}
              </Label>
            </div>
          ))
        )}
      </div>
      {!loading && selectedIds.length === 0 && (
        <p className="text-xs text-destructive">{t("selectCategories")}</p>
      )}
    </div>
  );
}
