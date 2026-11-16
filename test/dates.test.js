import { describe, expect, it } from "vitest";

import {
  addDaysDateOnly,
  addMonths,
  calendarGridDates,
  formatCurrency,
  formatDeparture,
  isUpcoming,
  isValidMonthKey,
  monthKeyOf,
  monthLabel,
  nightsBetween,
  toDateOnly,
} from "@/lib/dates";

describe("date-only handling", () => {
  it("accepts real calendar dates", () => {
    expect(toDateOnly("2026-03-01")).toBe("2026-03-01");
    expect(toDateOnly("2026-02-29")).toBe(null);
    expect(toDateOnly("2026-13-01")).toBe(null);
  });

  it("normalises timestamps to UTC before reducing to a day", () => {
    expect(toDateOnly("2026-05-01T23:30:00-05:00")).toBe("2026-05-02");
    expect(toDateOnly("not a date")).toBe(null);
  });

  it("formats departures in UTC regardless of the host timezone", () => {
    expect(formatDeparture("2026-03-01")).toBe("1 Mar 2026");
    expect(formatDeparture("2026-03-01", { withWeekday: true })).toBe("Sun, 1 Mar 2026");
  });

  it("adds days across month and year boundaries", () => {
    expect(addDaysDateOnly("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDaysDateOnly("2026-02-28", 1)).toBe("2026-03-01");
    expect(addDaysDateOnly("nonsense", 1)).toBe(null);
  });

  it("counts nights between two ISO instants", () => {
    expect(nightsBetween("2026-03-01T00:00:00Z", "2026-03-08T00:00:00Z")).toBe(7);
    expect(nightsBetween("nonsense", "2026-03-08T00:00:00Z")).toBe(null);
  });

  it("treats today as upcoming and yesterday as past", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isUpcoming(today)).toBe(true);
    expect(isUpcoming("2000-01-01")).toBe(false);
  });

  it("never fabricates a price", () => {
    expect(formatCurrency(1299)).toBe("$1,299");
    expect(formatCurrency("not a number")).toBe("Price on request");
    expect(formatCurrency(undefined)).toBe("Price on request");
  });
});

describe("calendar month helpers", () => {
  it("derives a month key from a date or timestamp", () => {
    expect(monthKeyOf("2026-03-14")).toBe("2026-03");
    expect(monthKeyOf("2026-03-14T22:00:00.000Z")).toBe("2026-03");
    expect(monthKeyOf("nonsense")).toBe(null);
  });

  it("validates month keys", () => {
    expect(isValidMonthKey("2026-03")).toBe(true);
    expect(isValidMonthKey("2026-13")).toBe(false);
    expect(isValidMonthKey("2026-00")).toBe(false);
    expect(isValidMonthKey("2026-3")).toBe(false);
    expect(isValidMonthKey(null)).toBe(false);
  });

  it("moves forward and backward across year boundaries", () => {
    expect(addMonths("2026-12", 1)).toBe("2027-01");
    expect(addMonths("2026-01", -1)).toBe("2025-12");
    expect(addMonths("2026-06", 12)).toBe("2027-06");
    expect(addMonths("nope", 1)).toBe(null);
  });

  it("labels the month in UTC", () => {
    expect(monthLabel("2026-03")).toBe("March 2026");
    expect(monthLabel("bad")).toBe("");
  });

  it("builds a six-week Monday-first grid covering the whole month", () => {
    const grid = calendarGridDates("2026-03");
    expect(grid).toHaveLength(42);
    // 1 March 2026 is a Sunday, so the grid starts on Monday 23 February.
    expect(grid[0]).toBe("2026-02-23");
    expect(grid).toContain("2026-03-01");
    expect(grid).toContain("2026-03-31");
    expect(grid[41]).toBe("2026-04-05");
    expect(calendarGridDates("bad")).toEqual([]);
  });
});
