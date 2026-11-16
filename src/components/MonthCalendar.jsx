"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/cn";
import {
  addDaysDateOnly,
  addMonths,
  calendarGridDates,
  formatDeparture,
  isValidMonthKey,
  monthKeyOf,
  monthLabel,
  todayDateOnly,
  todayMonthKey,
} from "@/lib/dates";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_MONTHS_AHEAD = 24;

/**
 * Month calendar for published departures.
 *
 * - `mode="select"` only published, future dates are selectable.
 * - `mode="manage"` lets operations toggle any future date (publish / disable).
 *
 * Keyboard: arrows move by day/week, Home/End jump within the week, PageUp/Down
 * change month. Selection uses real buttons, so screen readers get the weekday,
 * date and availability in the accessible name.
 */
export default function MonthCalendar({
  month,
  onMonthChange,
  availableDates = [],
  selected = null,
  onSelect,
  mode = "select",
  disabled = false,
  busyDate = null,
  idPrefix = "calendar",
  today = todayDateOnly(),
}) {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);
  const currentMonth = todayMonthKey();
  const maxMonth = addMonths(currentMonth, MAX_MONTHS_AHEAD) || currentMonth;
  const [focused, setFocused] = useState(selected || today);
  const pendingFocus = useRef(null);

  // Move real DOM focus after a keyboard step, including when that step crossed
  // into another month (the grid for the new month renders on the next pass).
  useEffect(() => {
    const date = pendingFocus.current;
    if (!date) return;
    const node = document.getElementById(`${idPrefix}-${date}`);
    if (node) {
      node.focus();
      pendingFocus.current = null;
    }
  }, [focused, month, idPrefix]);

  const grid = useMemo(() => calendarGridDates(month), [month]);
  // Roving tabindex must always point at a button that exists in the grid.
  const roving = grid.includes(focused) ? focused : grid.includes(today) ? today : grid[0];
  const label = monthLabel(month);
  const handleMonth = (delta) => {
    const next = addMonths(month, delta);
    if (!next || next < currentMonth || next > maxMonth) return;
    onMonthChange(next);
  };

  const canGoBack = month > currentMonth;
  const canGoForward = month < maxMonth;

  function selectable(date) {
    if (mode === "manage") return date >= today;
    return date >= today && availableSet.has(date);
  }

  function moveFocus(date) {
    if (!date) return;
    const targetMonth = monthKeyOf(date);
    if (date < today || !targetMonth || targetMonth > maxMonth) return;
    pendingFocus.current = date;
    setFocused(date);
    if (isValidMonthKey(targetMonth) && targetMonth !== month) onMonthChange(targetMonth);
  }

  function onKeyDown(event) {
    const key = event.key;
    let target = null;

    if (key === "ArrowLeft") target = addDaysDateOnly(roving, -1);
    else if (key === "ArrowRight") target = addDaysDateOnly(roving, 1);
    else if (key === "ArrowUp") target = addDaysDateOnly(roving, -7);
    else if (key === "ArrowDown") target = addDaysDateOnly(roving, 7);
    else if (key === "Home") {
      const weekday = (new Date(`${roving}T00:00:00.000Z`).getUTCDay() + 6) % 7;
      target = addDaysDateOnly(roving, -weekday);
    } else if (key === "End") {
      const weekday = (new Date(`${roving}T00:00:00.000Z`).getUTCDay() + 6) % 7;
      target = addDaysDateOnly(roving, 6 - weekday);
    } else if (key === "PageUp") {
      event.preventDefault();
      handleMonth(-1);
      return;
    } else if (key === "PageDown") {
      event.preventDefault();
      handleMonth(1);
      return;
    } else {
      return;
    }

    if (target) {
      event.preventDefault();
      moveFocus(target);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <CalendarDays size={16} aria-hidden="true" className="text-brand-ink" />
          <span aria-live="polite">{label}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handleMonth(-1)}
            disabled={!canGoBack}
            aria-label={`Previous month, ${monthLabel(addMonths(month, -1) || month)}`}
            className="rounded-full border border-line p-1.5 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => handleMonth(1)}
            disabled={!canGoForward}
            aria-label={`Next month, ${monthLabel(addMonths(month, 1) || month)}`}
            className="rounded-full border border-line p-1.5 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => (
          <abbr
            key={day}
            title={day}
            className="py-1 text-[10px] font-bold uppercase tracking-wide text-ink-subtle no-underline"
          >
            {day.slice(0, 2)}
          </abbr>
        ))}
      </div>

      <div
        role="group"
        aria-label={`${label} departures`}
        onKeyDown={onKeyDown}
        className="mt-1 grid grid-cols-7 gap-1"
      >
        {grid.map((date) => {
          const inMonth = monthKeyOf(date) === month;
          const isToday = date === today;
          const isAvailable = availableSet.has(date);
          const isSelectable = selectable(date);
          const isSelected = selected === date;
          const isBusy = busyDate === date;
          const isPast = date < today;

          return (
            <button
              key={date}
              id={`${idPrefix}-${date}`}
              type="button"
              tabIndex={roving === date ? 0 : -1}
              aria-pressed={mode === "select" && isSelectable ? isSelected : undefined}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${formatDeparture(date, { withWeekday: true })}${
                isSelected ? " — selected" : ""
              }${isAvailable ? " — published" : ""}${isPast ? " — past" : ""}${
                !isSelectable && !isPast ? " — not published" : ""
              }`}
              disabled={disabled || !isSelectable || isBusy}
              onClick={() => {
                setFocused(date);
                if (isSelectable) onSelect?.(date);
              }}
              onFocus={() => setFocused(date)}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors",
                !inMonth && "opacity-40",
                isSelected
                  ? "bg-brand font-bold text-on-brand shadow-sm"
                  : isAvailable
                    ? "bg-brand-soft font-semibold text-brand-ink hover:bg-brand-soft/70"
                    : "text-ink-subtle hover:bg-surface-muted",
                mode === "manage" && isSelectable && !isAvailable && "hover:text-ink",
                !isSelectable && "cursor-not-allowed",
                isBusy && "animate-pulse",
              )}
            >
              <span className="leading-none">{Number(date.slice(8, 10))}</span>
              {isToday ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    isSelected ? "bg-on-brand" : "bg-brand",
                  )}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[11px] text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-brand-soft ring-1 ring-brand-line" />
          Published
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-brand" />
          Selected
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full border border-line-strong" />
          Not published
        </span>
      </div>
    </div>
  );
}
