/**
 * Currency formatting utilities for Vietnamese Dong (VND)
 */

/**
 * Format a number as Vietnamese Dong with proper locale formatting
 * @param value - The numeric value to format
 * @returns Formatted currency string (e.g., "100.000 ₫")
 * @example
 * formatVND(100000) // "100.000 ₫"
 * formatVND(1234567) // "1.234.567 ₫"
 */
export function formatVND(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

/**
 * Parse a VND formatted string back to a number
 * @param formatted - The formatted currency string
 * @returns The numeric value
 * @example
 * parseVND("100.000 ₫") // 100000
 */
export function parseVND(formatted: string): number {
  return Number(formatted.replace(/[^\d]/g, ""));
}

/**
 * Format a number as compact VND (using K, M suffixes for large numbers)
 * @param value - The numeric value to format
 * @returns Compact formatted string (e.g., "1.2M ₫")
 * @example
 * formatCompactVND(1200000) // "1.2M ₫"
 * formatCompactVND(45000) // "45K ₫"
 */
export function formatCompactVND(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M ₫`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K ₫`;
  }
  return formatVND(value);
}
