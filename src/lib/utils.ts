import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProductSize } from "@/enums";
import { CATEGORY_DISPLAY_NAMES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export utilities for backwards compatibility
export { formatVND, formatCompactVND, parseVND } from "@/utils/format-currency";
export { formatDateRange, formatShortDate, formatLongDate, formatDateTime, formatRelativeTime, formatInputDate } from "@/utils/format-date";

export function formatCategory(cat: string): string {
  return CATEGORY_DISPLAY_NAMES[cat] ?? cat.replaceAll("-", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
}

export function parseProductSize(value?: string | null): ProductSize | null {
  if (!value) return null;

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^size\s+/i, "");

  if (["small", "nhỏ", "nho", "s"].includes(normalized)) {
    return ProductSize.Small;
  }

  if (["medium", "vừa", "vua", "m"].includes(normalized)) {
    return ProductSize.Medium;
  }

  if (["large", "lớn", "lon", "l"].includes(normalized)) {
    return ProductSize.Large;
  }

  return null;
}

export function formatProductSize(
  value?: string | null,
  locale: string = "en"
): string {
  const parsed = parseProductSize(value);

  if (!parsed) {
    return value?.trim() ?? "";
  }

  if (locale.startsWith("vi")) {
    if (parsed === ProductSize.Small) return "Nhỏ";
    if (parsed === ProductSize.Medium) return "Vừa";
    return "Lớn";
  }

  return parsed;
}
