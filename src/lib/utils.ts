import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CATEGORY_DISPLAY_NAMES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Vietnamese Dong, e.g. 100000 → "100.000 ₫" */
export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function formatCategory(cat: string): string {
  return CATEGORY_DISPLAY_NAMES[cat] ?? cat.replaceAll("-", " ").replaceAll(/\b\w/g, (c) => c.toUpperCase());
}
