import { Check, Clock, X } from "lucide-react";

import { buildTimeline } from "@/lib/booking-status";
import { formatTimestamp } from "@/lib/dates";
import { cn } from "@/lib/cn";

const ICONS = {
  complete: Check,
  current: Clock,
  stopped: X,
  upcoming: Clock,
};

/**
 * Accessible, truthful booking timeline. Renders only real timestamps.
 */
export default function BookingTimeline({ booking, className }) {
  const steps = buildTimeline(booking);

  return (
    <ol className={cn("space-y-0", className)} aria-label="Booking progress">
      {steps.map((step, index) => {
        const Icon = ICONS[step.state] || Clock;
        const isLast = index === steps.length - 1;
        const tone =
          step.state === "complete"
            ? "bg-success-soft text-success border-success-line"
            : step.state === "stopped"
              ? "bg-danger-soft text-danger border-danger-line"
              : step.state === "current"
                ? "bg-warning-soft text-warning border-warning-line"
                : "bg-surface-muted text-ink-subtle border-line";

        return (
          <li key={step.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!isLast ? (
              <span
                aria-hidden="true"
                className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-line"
              />
            ) : null}
            <span
              className={cn(
                "relative z-10 mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                tone,
              )}
            >
              <Icon size={13} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{step.title}</p>
              <p className="text-xs leading-relaxed text-ink-muted">{step.description}</p>
              {step.timestamp ? (
                <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-subtle">
                  {formatTimestamp(step.timestamp)}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
