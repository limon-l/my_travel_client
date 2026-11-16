import { BarChart3, CalendarClock, Trophy } from "lucide-react";

import StatusBadge from "@/components/StatusBadge";
import { EmptyState } from "@/components/ui";
import { formatDeparture, formatTimestamp } from "@/lib/dates";

/**
 * Operations analytics.
 *
 * Every number here is a direct response field from `/api/admin/summary`; no
 * metric is derived from anything the API does not return. Charts are plain SVG-
 * free CSS bars, so they inherit the active theme and ship no chart dependency.
 * Each chart has a real data table fallback for screen readers and keyboard use.
 */

function DataTable({ caption, head, rows }) {
  return (
    <details className="mt-3 rounded-xl border border-line bg-surface-muted/60 px-3 py-2 text-xs">
      <summary className="cursor-pointer font-semibold text-ink-muted">
        View data table
      </summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {head.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-subtle"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-line">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-2 py-1.5 text-ink-muted">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

function Card({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-ink">
          <Icon size={17} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function RequestsTrend({ days = [] }) {
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const peak = Math.max(0, ...days.map((day) => day.count));
  const range =
    days.length > 0
      ? `${formatDeparture(days[0].date)} – ${formatDeparture(days[days.length - 1].date)}`
      : "";

  return (
    <Card
      icon={BarChart3}
      title="Requests received"
      description={`${range} · ${total} total · peak ${peak} in one day`}
    >
      <div
        role="img"
        aria-label={`Bar chart of booking requests received per day over the last ${days.length} days. ${total} in total, with a peak of ${peak} requests on a single day.`}
        className="flex h-40 items-end gap-1.5"
      >
        {days.map((day) => {
          const height = peak === 0 ? 0 : Math.round((day.count / peak) * 100);
          return (
            <div key={day.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] font-semibold text-ink-subtle">
                {day.count > 0 ? day.count : ""}
              </span>
              <div
                className="w-full rounded-t bg-brand"
                style={{ height: `${Math.max(day.count > 0 ? 8 : 2, height)}%`, opacity: day.count > 0 ? 1 : 0.25 }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5" aria-hidden="true">
        {days.map((day, index) => (
          <span key={day.date} className="flex-1 text-center text-[10px] text-ink-subtle">
            {index === 0 || day.date.slice(8, 10) === "01"
              ? `${Number(day.date.slice(8, 10))} ${formatDeparture(day.date).split(" ")[1]}`
              : Number(day.date.slice(8, 10))}
          </span>
        ))}
      </div>
      <DataTable
        caption="Requests received per day"
        head={["Date", "Requests"]}
        rows={days.map((day) => [formatDeparture(day.date, { withWeekday: true }), day.count])}
      />
    </Card>
  );
}

export function StatusDistribution({ pending = 0, confirmed = 0, rejected = 0 }) {
  const total = pending + confirmed + rejected;
  const segments = [
    { label: "Pending", count: pending, className: "bg-warning" },
    { label: "Confirmed", count: confirmed, className: "bg-success" },
    { label: "Rejected", count: rejected, className: "bg-danger" },
  ];

  return (
    <Card
      icon={CalendarClock}
      title="Decision mix"
      description={total === 0 ? "No requests yet" : `${total} requests in total`}
    >
      {total === 0 ? (
        <p className="text-sm text-ink-muted">
          The mix appears once travellers submit requests against published departures.
        </p>
      ) : (
        <>
          <div
            role="img"
            aria-label={segments
              .map((segment) => `${segment.label}: ${segment.count}`)
              .join(", ")}
            className="flex h-3 w-full overflow-hidden rounded-full bg-surface-muted"
          >
            {segments.map((segment) =>
              segment.count > 0 ? (
                <div
                  key={segment.label}
                  className={segment.className}
                  style={{ width: `${(segment.count / total) * 100}%` }}
                />
              ) : null,
            )}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {segments.map((segment) => (
              <li key={segment.label} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-ink-muted">
                  <span
                    aria-hidden="true"
                    className={`h-2.5 w-2.5 rounded-full ${segment.className}`}
                  />
                  {segment.label}
                </span>
                <span className="font-semibold text-ink">
                  {segment.count}
                  <span className="ml-1 text-xs font-normal text-ink-subtle">
                    ({Math.round((segment.count / total) * 100)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}

export function TopTours({ tours = [] }) {
  const max = Math.max(0, ...tours.map((tour) => tour.count));

  return (
    <Card
      icon={Trophy}
      title="Most requested journeys"
      description="By lifetime request volume, not revenue"
    >
      {tours.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Journey demand appears after the first request is submitted.
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {tours.map((tour) => (
              <li key={tour.tourTitle}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink">{tour.tourTitle}</span>
                  <span className="shrink-0 text-xs font-semibold text-ink-muted">
                    {tour.count}
                  </span>
                </div>
                <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${max === 0 ? 0 : Math.round((tour.count / max) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <DataTable
            caption="Requests per journey"
            head={["Journey", "Requests"]}
            rows={tours.map((tour) => [tour.tourTitle, tour.count])}
          />
        </>
      )}
    </Card>
  );
}

export function RecentActivity({ bookings = [] }) {
  return (
    <Card
      icon={CalendarClock}
      title="Recent activity"
      description="The six most recent requests across the catalogue"
    >
      {bookings.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No activity yet"
          description="Recent booking requests will appear here."
          className="py-8"
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Most recent booking requests</caption>
            <thead>
              <tr className="border-b border-line">
                {["Journey", "Traveller", "Departure", "Status", "Submitted"].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="whitespace-nowrap px-2 py-2 text-[11px] font-bold uppercase tracking-wide text-ink-subtle"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b border-line last:border-0">
                  <td className="max-w-[12rem] truncate px-2 py-2 text-ink">
                    {booking.tourTitle || "Journey"}
                  </td>
                  <td className="max-w-[10rem] truncate px-2 py-2 text-ink-muted">
                    {booking.userName || "Traveller"}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-ink-muted">
                    {formatDeparture(booking.startDate)}
                  </td>
                  <td className="px-2 py-2">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-xs text-ink-muted">
                    {formatTimestamp(booking.createdAt) || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
