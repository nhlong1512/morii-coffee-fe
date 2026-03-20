import type { ApiProductSize } from "@/types/api";

export const ALL_SIZES: ApiProductSize[] = ["Small", "Medium", "Large"];

export function generateSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replaceAll(/[^\w\s-]/g, "")
    .replaceAll(/[\s_]+/g, "-")
    .replaceAll(/-+/g, "-");
}

export function toggleArrayItem<T>(prev: T[], item: T): T[] {
  return prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item];
}

export function toggleSetItem(prev: Set<string>, item: string): Set<string> {
  const next = new Set(prev);
  if (next.has(item)) next.delete(item);
  else next.add(item);
  return next;
}
