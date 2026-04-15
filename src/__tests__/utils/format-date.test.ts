import {
  formatShortDate,
  formatLongDate,
  formatDateTime,
  formatDateRange,
  formatRelativeTime,
  formatInputDate,
} from "@/utils/format-date";

const ISO = "2024-01-15T10:30:00.000Z";

describe("formatShortDate", () => {
  it("formats an ISO string as short date", () => {
    const result = formatShortDate(ISO);
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
  });

  it("formats a Date object", () => {
    const result = formatShortDate(new Date("2024-06-20"));
    expect(result).toMatch(/Jun/);
    expect(result).toMatch(/2024/);
  });

  it("does not include time", () => {
    const result = formatShortDate(ISO);
    expect(result).not.toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("formatLongDate", () => {
  it("formats an ISO string with full month name", () => {
    const result = formatLongDate(ISO);
    expect(result).toMatch(/January/);
    expect(result).toMatch(/2024/);
  });

  it("formats a Date object", () => {
    const result = formatLongDate(new Date("2024-03-05"));
    expect(result).toMatch(/March/);
  });
});

describe("formatDateTime", () => {
  it("includes both date and time", () => {
    const result = formatDateTime(ISO);
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/2024/);
    // Should include AM/PM time indicator
    expect(result).toMatch(/AM|PM/);
  });

  it("formats a Date object", () => {
    const result = formatDateTime(new Date(ISO));
    expect(result).toMatch(/AM|PM/);
  });
});

describe("formatDateRange", () => {
  it("formats a date range with arrow separator", () => {
    const result = formatDateRange("2024-01-01", "2024-01-31");
    expect(result).toContain("→");
  });

  it("includes start and end dates in the range", () => {
    const result = formatDateRange("2024-01-01", "2024-12-31");
    expect(result).toMatch(/Jan/);
    expect(result).toMatch(/Dec/);
    expect(result).toMatch(/2024/);
  });

  it("formats in DD MMM YYYY format", () => {
    const result = formatDateRange("2024-01-01", "2024-01-31");
    // Should have two-digit day
    expect(result).toMatch(/\d{2} \w{3} \d{4}/);
  });
});

describe("formatRelativeTime", () => {
  it('returns "just now" for time less than 60 seconds ago', () => {
    const recent = new Date(Date.now() - 30 * 1000).toISOString();
    expect(formatRelativeTime(recent)).toBe("just now");
  });

  it("returns minutes ago for time less than 60 minutes ago", () => {
    const past = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toBe("5 minutes ago");
  });

  it("returns singular minute for exactly 1 minute ago", () => {
    const past = new Date(Date.now() - 1 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toBe("1 minute ago");
  });

  it("returns hours ago for time less than 24 hours ago", () => {
    const past = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toBe("3 hours ago");
  });

  it("returns singular hour for exactly 1 hour ago", () => {
    const past = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toBe("1 hour ago");
  });

  it("returns days ago for time less than 7 days ago", () => {
    const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toBe("3 days ago");
  });

  it("returns singular day for exactly 1 day ago", () => {
    const past = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(past)).toBe("1 day ago");
  });

  it("falls back to formatShortDate for dates 7+ days ago", () => {
    const past = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(past);
    // Should not include "ago" — falls back to a date string
    expect(result).not.toMatch(/ago/);
    expect(result).toMatch(/\d{4}/); // contains a year
  });
});

describe("formatInputDate", () => {
  it("returns YYYY-MM-DD format from ISO string", () => {
    const result = formatInputDate("2024-03-05T00:00:00.000Z");
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("zero-pads month and day", () => {
    const result = formatInputDate(new Date(2024, 0, 5)); // Jan 5
    expect(result).toMatch(/-01-05$/);
  });

  it("returns correct year", () => {
    const result = formatInputDate("2024-11-20");
    expect(result.startsWith("2024")).toBe(true);
  });
});
