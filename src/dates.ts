export interface DateRange {
  startDate: string;
  endDate: string;
}

/** Formats a Date as yyyy-MM-dd in UTC, matching the SI API's date format. */
export function toApiDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Trailing-12-month window ending at `now`. */
export function defaultYearRange(now: Date = new Date()): DateRange {
  const start = new Date(now);
  start.setUTCFullYear(start.getUTCFullYear() - 1);
  return { startDate: toApiDate(start), endDate: toApiDate(now) };
}
