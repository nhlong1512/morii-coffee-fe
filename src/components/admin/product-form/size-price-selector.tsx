"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ALL_SIZES } from "@/utils/products";

interface SizePriceSelectorProps {
  selectedSizes: Set<string>;
  sizeModifiers: Record<string, string>;
  onToggle: (size: string) => void;
  onModifierChange: (size: string, value: string) => void;
}

export function SizePriceSelector({
  selectedSizes,
  sizeModifiers,
  onToggle,
  onModifierChange,
}: SizePriceSelectorProps) {
  return (
    <div className="space-y-3">
      <Label>Sizes</Label>
      <div className="space-y-3">
        {ALL_SIZES.map((size) => (
          <div key={size} className="flex items-center gap-3">
            <Checkbox
              id={`size-${size}`}
              checked={selectedSizes.has(size)}
              onCheckedChange={() => onToggle(size)}
            />
            <Label htmlFor={`size-${size}`} className="w-16 font-medium">
              {size}
            </Label>
            {selectedSizes.has(size) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">+₫</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-8 w-24"
                  value={sizeModifiers[size] ?? ""}
                  onChange={(e) => onModifierChange(size, e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
