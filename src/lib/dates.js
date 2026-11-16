/**
 * Departures are calendar dates (`YYYY-MM-DD`) stored and compared in UTC.
 * Formatting explicitly uses `timeZone: "UTC"` so a traveller in Dhaka and an
 * operator in London see the same departure day.
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function toDateOnly(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string") return null;
  if (DATE_ONLY.test(value)) {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10) === value ? value : null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function todayDateOnly() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDeparture(value, { withWeekday = false } = {}) {
  const dateOnly = toDateOnly(value);
  if (!dateOnly) return "Date not set";
  const date = new Date(`${dateOnly}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withWeekday ? { weekday: "short" } : {}),
    timeZone: "UTC",
  }).format(date);
}

export function formatTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(date);
}

export function nightsBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000);
}

export function addDaysDateOnly(dateOnly, days) {
  const parsed = new Date(`${dateOnly}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function isUpcoming(dateOnly) {
  const normalized = toDateOnly(dateOnly);
  if (!normalized) return false;
  return normalized >= todayDateOnly();
}

export function monthKeyOf(value) {
  const normalized = toDateOnly(value);
  return normalized ? normalized.slice(0, 7) : null;
}

export function todayMonthKey() {
  return todayDateOnly().slice(0, 7);
}

export function isValidMonthKey(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) return false;
  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12;
}

export function addMonths(monthKey, delta) {
  if (!isValidMonthKey(monthKey) || !Number.isFinite(Number(delta))) return null;
  const date = new Date(`${monthKey}-01T00:00:00.000Z`);
  date.setUTCMonth(date.getUTCMonth() + Number(delta));
  return date.toISOString().slice(0, 7);
}

export function monthLabel(monthKey) {
  if (!isValidMonthKey(monthKey)) return "";
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${monthKey}-01T00:00:00.000Z`));
}

/**
 * Six Monday-first weeks (42 calendar dates) covering the month, so the grid
 * height never jumps between months.
 */
export function calendarGridDates(monthKey) {
  if (!isValidMonthKey(monthKey)) return [];
  const first = new Date(`${monthKey}-01T00:00:00.000Z`);
  const offset = (first.getUTCDay() + 6) % 7;
  const start = new Date(first.getTime() - offset * 86_400_000);
  return Array.from({ length: 42 }, (_, index) =>
    new Date(start.getTime() + index * 86_400_000).toISOString().slice(0, 10),
  );
}

export function formatCurrency(value, currency = "USD") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price on request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
