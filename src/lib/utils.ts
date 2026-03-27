import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
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
