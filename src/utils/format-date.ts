/**
 * Date formatting utilities for consistent date display across the application
 */

/**
 * Format a date string as short date (e.g., "Jan 1, 2024")
 * @param dateStr - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatShortDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date string as long date (e.g., "January 1, 2024")
 * @param dateStr - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatLongDate(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a date string with time (e.g., "Jan 1, 2024, 10:30 AM")
 * @param dateStr - ISO date string or Date object
 * @returns Formatted date and time string
 */
export function formatDateTime(dateStr: string | Date): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format a date range as "DD MMM YYYY → DD MMM YYYY"
 * @param start - Start date ISO string
 * @param end - End date ISO string
 * @returns Formatted date range string
 * @example
 * formatDateRange("2024-01-01", "2024-01-31") // "01 Jan 2024 → 31 Jan 2024"
 */
export function formatDateRange(start: string, end: string): string {
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  return `${fmt(start)} → ${fmt(end)}`;
}

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 * @param dateStr - ISO date string or Date object
 * @returns Relative time string
 */
export function formatRelativeTime(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return formatShortDate(date);
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param dateStr - ISO date string or Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatInputDate(dateStr: string | Date): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
