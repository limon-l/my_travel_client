"use client";

import { Alert, Spinner } from "@/components/ui";
import { addDaysDateOnly, formatDeparture, formatCurrency, nightsBetween } from "@/lib/dates";
import { cn } from "@/lib/cn";

/**
 * Keyboard- and screen-reader-friendly departure chooser.
 * Uses native radio inputs so arrow keys, Home/End and form semantics work
 * without re-implementing a listbox.
 */
export default function DeparturePicker({
  departures = [],
  selected,
  onSelect,
  durationDays,
  loading = false,
  error = null,
  onRetry,
  price,
  name = "departure",
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-muted px-4 py-6 text-sm text-ink-muted">
        <Spinner className="text-lagoon-600" />
        Checking the latest departures…
      </div>
    );
  }

  if (error) {
    return (
      <Alert tone="danger" role="alert" title="Departures could not be loaded">
        <p>{error}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-full border border-current px-3 py-1 text-xs font-semibold"
          >
            Try again
          </button>
        ) : null}
      </Alert>
    );
  }

  if (departures.length === 0) {
    return (
      <Alert tone="warning" title="No departures published yet">
        Operations has not published a bookable date for this tour. Nothing can be
        requested until a date appears here — this is not a sold-out signal.
      </Alert>
    );
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">
        Choose a published departure
      </legend>
      <div className="space-y-2">
        {departures.map((date) => {
          const id = `${name}-${date}`;
          const isSelected = selected === date;
          const returnDate = addDaysDateOnly(date, Number(durationDays) || 0);
          const nights = returnDate ? nightsBetween(`${date}T00:00:00Z`, `${returnDate}T00:00:00Z`) : null;

          return (
            <label
              key={date}
              htmlFor={id}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors",
                isSelected
                  ? "border-lagoon-600 bg-lagoon-50"
                  : "border-line-strong bg-surface hover:border-sand-400 hover:bg-sand-50",
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                <input
                  id={id}
                  type="radio"
                  name={name}
                  value={date}
                  checked={isSelected}
                  onChange={() => onSelect(date)}
                  className="h-4 w-4 shrink-0 accent-lagoon-600"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-ink">
                    {formatDeparture(date, { withWeekday: true })}
                  </span>
                  <span className="block text-xs text-ink-muted">
                    {nights ? `${nights} nights` : "Duration not set"}
                    {returnDate ? ` · returns ${formatDeparture(returnDate)}` : ""}
                  </span>
                </span>
              </span>
              {Number.isFinite(Number(price)) ? (
                <span className="shrink-0 text-sm font-semibold text-ocean-900">
                  {formatCurrency(price)}
                </span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
