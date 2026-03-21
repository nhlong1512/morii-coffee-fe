"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ProductSize } from "@/enums";
import { ALL_SIZES } from "@/utils/products";
import type { ApiProductVariant } from "@/types/api";

export interface StagedVariant {
  /** Present if already saved on the server — distinguishes existing from new. */
  serverId?: string;
  name: string;
  size: ProductSize;
  additionalPrice: string;
  sku: string;
  stockQuantity: string;
  isDefault: boolean;
  isAvailable: boolean;
  /** Existing variant has unsaved local edits. */
  dirty?: boolean;
  /** Existing variant is pending deletion — hidden from UI, removed on save. */
  deleted?: boolean;
}

interface ProductVariantsEditorProps {
  /** Pre-populate from server data (edit mode). Leave undefined for create mode. */
  initialVariants?: ApiProductVariant[];
  /** Called whenever local variant state changes. */
  onChange: (variants: StagedVariant[]) => void;
}

function fromServer(v: ApiProductVariant): StagedVariant {
  return {
    serverId: v.id,
    name: v.name,
    size: v.size,
    additionalPrice: v.additionalPrice.toString(),
    sku: v.sku ?? "",
    stockQuantity: v.stockQuantity.toString(),
    isDefault: v.isDefault,
    isAvailable: v.isAvailable,
  };
}

function emptyVariant(): StagedVariant {
  return {
    name: "",
    size: ProductSize.Small,
    additionalPrice: "0",
    sku: "",
    stockQuantity: "-1",
    isDefault: false,
    isAvailable: true,
  };
}

export function ProductVariantsEditor({
  initialVariants = [],
  onChange,
}: Readonly<ProductVariantsEditorProps>) {
  const [variants, setVariants] = React.useState<StagedVariant[]>(
    initialVariants.map(fromServer)
  );

  // Stable ref so the effect doesn't need onChange in its deps.
  const onChangeRef = React.useRef(onChange);
  React.useLayoutEffect(() => { onChangeRef.current = onChange; });
  React.useEffect(() => {
    onChangeRef.current(variants);
  }, [variants]);

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

  const removeVariant = (index: number) => {
    setVariants((prev) => {
      const variant = prev[index];
      if (variant.serverId) {
        // Existing — mark deleted, keep in array so parent can batch the DELETE on save
        return prev.map((v, i) => (i === index ? { ...v, deleted: true } : v));
      }
      // Unsaved new — drop immediately
      return prev.filter((_, i) => i !== index);
    });
  };

  const update = (index: number, patch: Partial<StagedVariant>) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        return { ...v, ...patch, ...(v.serverId ? { dirty: true } : {}) };
      })
    );
  };

  const setDefault = (index: number) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        const newIsDefault = i === index;
        if (v.isDefault === newIsDefault) return v;
        return { ...v, isDefault: newIsDefault, ...(v.serverId ? { dirty: true } : {}) };
      })
    );
  };

  const visibleVariants = variants
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => !v.deleted);

  return (
    <div className="space-y-3">
      {visibleVariants.length === 0 && (
        <p className="text-sm text-muted-foreground">No variants added yet.</p>
      )}

      {visibleVariants.map(({ v, i }) => {
        const isNew = !v.serverId;
        const stockDisplay = v.stockQuantity === "-1" || v.stockQuantity === "" ? "Unlimited" : null;

        return (
          <div
            key={v.serverId ?? `new-${i}`}
            className={cn(
              "relative rounded-lg border p-4 transition-colors",
              v.dirty ? "border-amber-400/60 bg-amber-50/40 dark:bg-amber-950/20" : "border-border"
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeVariant(i)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Status badges */}
            <div className="mb-3 flex gap-2">
              {isNew && (
                <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  New — saved on submit
                </span>
              )}
              {v.dirty && (
                <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="grid gap-3 pr-8 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input
                  placeholder="e.g. Small (700ml)"
                  value={v.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  className="h-8"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Size</Label>
                <select
                  value={v.size}
                  onChange={(e) => update(i, { size: e.target.value as ProductSize })}
                  className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  {ALL_SIZES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Additional Price (₫)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={v.additionalPrice}
                  onChange={(e) => update(i, { additionalPrice: e.target.value })}
                  className="h-8"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">SKU</Label>
                <Input
                  placeholder="Optional"
                  value={v.sku}
                  onChange={(e) => update(i, { sku: e.target.value })}
                  className="h-8"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Stock Quantity</Label>
                <Input
                  type="number"
                  min="-1"
                  step="1"
                  placeholder="-1"
                  value={v.stockQuantity}
                  onChange={(e) => update(i, { stockQuantity: e.target.value })}
                  className="h-8"
                />
                <p className="text-xs text-muted-foreground">
                  {stockDisplay ? stockDisplay : `${v.stockQuantity} units`} · -1 = unlimited
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={v.isDefault}
                    onCheckedChange={(checked) => {
                      if (checked) setDefault(i);
                      else update(i, { isDefault: false });
                    }}
                  />
                  <Label className="text-xs">Default variant</Label>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={v.isAvailable}
                    onCheckedChange={(checked) => update(i, { isAvailable: checked })}
                  />
                  <Label className="text-xs">Available</Label>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" onClick={addVariant}>
        <Plus className="mr-1.5 h-4 w-4" /> Add Variant
      </Button>
    </div>
  );
}
