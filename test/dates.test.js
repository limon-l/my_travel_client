import { describe, expect, it } from "vitest";

import {
  addDaysDateOnly,
  formatCurrency,
  formatDeparture,
  isUpcoming,
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
