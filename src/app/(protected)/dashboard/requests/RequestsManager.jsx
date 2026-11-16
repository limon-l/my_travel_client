"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Eye,
  Loader2,
  Search,
  XCircle,
} from "lucide-react";

import StatusBadge from "@/components/StatusBadge";
import MonthCalendar from "@/components/MonthCalendar";
import Dialog from "@/components/ui/Dialog";
import {
  Alert,
  Button,
  EmptyState,
  Field,
  inputClasses,
  LoadingState,
} from "@/components/ui";
import { ApiError, api } from "@/lib/api-client";
import {
  formatCurrency,
  formatDeparture,
  formatTimestamp,
  isUpcoming,
  monthKeyOf,
  todayDateOnly,
  todayMonthKey,
} from "@/lib/dates";
import { cn } from "@/lib/cn";

const FILTERS = ["Pending", "Confirmed", "Rejected", "All"];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "departure", label: "Departure date" },
  { value: "traveller", label: "Traveller name" },
];

function messageFor(error, fallback) {
  return error instanceof ApiError ? error.message : fallback;
}

function bookingRef(booking) {
  return String(booking?._id || "").slice(-8).toUpperCase();
}

function monthForTour(tour) {
  const upcoming = (Array.isArray(tour?.availableDates) ? tour.availableDates : [])
    .filter((date) => isUpcoming(date))
    .sort();
  return upcoming.length > 0 ? monthKeyOf(upcoming[0]) : todayMonthKey();
}

export default function RequestsManager() {
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState("Pending");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedTourId, setSelectedTourId] = useState("");
  const [monthByTour, setMonthByTour] = useState({});
  const [dateInput, setDateInput] = useState("");
  const [dateError, setDateError] = useState(null);
  const [savingDates, setSavingDates] = useState(false);
  const [dateNotice, setDateNotice] = useState(null);

  const [detail, setDetail] = useState(null);
  const [action, setAction] = useState(null);
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [bookingData, tourData] = await Promise.all([
          api.admin.listBookings(),
          api.listTours(),
        ]);
        if (!active) return;
        setBookings(Array.isArray(bookingData) ? bookingData : []);
        const tourList = Array.isArray(tourData) ? tourData : [];
        setTours(tourList);
        setSelectedTourId((current) =>
          current && tourList.some((tour) => tour._id === current)
            ? current
            : tourList[0]?._id || "",
        );
        setLoadError(null);
      } catch (error) {
        if (!active) return;
        setLoadError(messageFor(error, "The operations data could not be loaded."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const selectedTour = tours.find((tour) => tour._id === selectedTourId) || null;
  const selectedDates = useMemo(
    () => (Array.isArray(selectedTour?.availableDates) ? [...selectedTour.availableDates].sort() : []),
    [selectedTour],
  );

  // Open the scheduler on the first month that actually has a departure. The
  // month is tracked per journey, so switching journeys never loses your place
  // and no state has to be written from an effect.
  const month = monthByTour[selectedTourId] || monthForTour(selectedTour);
  function setMonth(next) {
    setMonthByTour((current) => ({ ...current, [selectedTourId]: next }));
  }

  const counts = useMemo(
    () =>
      bookings.reduce(
        (acc, booking) => {
          acc[booking.status] = (acc[booking.status] || 0) + 1;
          return acc;
        },
        { Pending: 0, Confirmed: 0, Rejected: 0 },
      ),
    [bookings],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const base = filter === "All" ? bookings : bookings.filter((b) => b.status === filter);
    const searched =
      needle.length === 0
        ? base
        : base.filter((booking) =>
            [booking.tourTitle, booking.userName, booking.userEmail, booking._id]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(needle),
          );

    const copy = [...searched];
    if (sort === "departure") {
      copy.sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)));
    } else if (sort === "traveller") {
      copy.sort((a, b) =>
        String(a.userName || "").localeCompare(String(b.userName || ""), undefined, {
          sensitivity: "base",
        }),
      );
    } else {
      copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return copy;
  }, [bookings, filter, query, sort]);

  function closeAction() {
    if (acting) return;
    setAction(null);
    setActionError(null);
    setNote("");
  }

  function openDecision(booking, status) {
    setDetail(null);
    setAction({ kind: "decision", booking, status });
    setNote("");
    setActionError(null);
  }

  function openDisable(date) {
    setAction({ kind: "disable-date", date });
    setActionError(null);
  }

  function openClear() {
    setAction({ kind: "clear-dates" });
    setActionError(null);
  }

  async function persistDates(nextDates, successMessage) {
    if (!selectedTour) return false;
    setSavingDates(true);
    setDateError(null);
    setDateNotice(null);
    try {
      const result = await api.admin.setAvailableDates(selectedTour._id, nextDates);
      const normalized = Array.isArray(result?.availableDates) ? result.availableDates : nextDates;
      setTours((current) =>
        current.map((tour) =>
          tour._id === selectedTour._id ? { ...tour, availableDates: normalized } : tour,
        ),
      );
      const affected = Array.isArray(result?.affectedBookings) ? result.affectedBookings : [];
      setDateNotice({
        tone: affected.length > 0 ? "warning" : "success",
        title: successMessage,
        body:
          affected.length > 0
            ? `${affected.length} existing request${affected.length === 1 ? "" : "s"} still reference the disabled date${affected.length === 1 ? "" : "s"}: ${affected
                .map((item) => `${formatDeparture(item.date)} (${item.status})`)
                .join(", ")}. They were not deleted or rejected.`
            : "No existing booking references the changed dates.",
      });
      return true;
    } catch (error) {
      setDateError(messageFor(error, "The departure dates could not be updated."));
      return false;
    } finally {
      setSavingDates(false);
    }
  }

  async function addDate(event) {
    event.preventDefault();
    if (!selectedTour) return;
    if (!dateInput) {
      setDateError("Choose a date first.");
      return;
    }
    if (dateInput < todayDateOnly()) {
      setDateError("Departures must be today or later.");
      return;
    }
    if (selectedDates.includes(dateInput)) {
      setDateError("That date is already published for this journey.");
      return;
    }
    const ok = await persistDates([...selectedDates, dateInput], "Departure published");
    if (ok) setDateInput("");
  }

  // Calendar manage mode: an unpublished date is published immediately, a
  // published date opens the confirmation dialog because it may affect bookings.
  async function toggleCalendarDate(date) {
    if (!selectedTour || savingDates) return;
    if (selectedDates.includes(date)) {
      openDisable(date);
      return;
    }
    await persistDates([...selectedDates, date], "Departure published");
  }

  async function confirmAction() {
    if (!action) return;
    setActing(true);
    setActionError(null);
    try {
      if (action.kind === "decision") {
        const result = await api.admin.setBookingStatus(
          action.booking._id,
          action.status,
          note.trim() || undefined,
        );
        const updated = result?.booking;
        setBookings((current) =>
          current.map((booking) =>
            booking._id === action.booking._id
              ? { ...booking, ...(updated || {}), status: action.status }
              : booking,
          ),
        );
      } else if (action.kind === "disable-date") {
        const ok = await persistDates(
          selectedDates.filter((date) => date !== action.date),
          "Departure disabled",
        );
        if (!ok) {
          setActing(false);
          return;
        }
      } else if (action.kind === "clear-dates") {
        const ok = await persistDates([], "All departures disabled");
        if (!ok) {
          setActing(false);
          return;
        }
      }
      setAction(null);
      setNote("");
    } catch (error) {
      setActionError(messageFor(error, "That action could not be completed."));
      // Another administrator may have decided this request while the dialog was
      // open. Reload the authoritative queue instead of leaving stale actions.
      if (error instanceof ApiError && error.status === 409) {
        try {
          const fresh = await api.admin.listBookings();
          setBookings(Array.isArray(fresh) ? fresh : []);
          setDetail(null);
        } catch {
          /* The original conflict message is still the useful one. */
        }
      }
    } finally {
      setActing(false);
    }
  }

  if (loading) return <LoadingState label="Loading requests and departures…" />;

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="text-3xl text-ink sm:text-4xl">Requests &amp; departures</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          Confirm or reject Pending requests, then publish real calendar dates. A
          decision is final: Confirmed and Rejected requests cannot be moved again.
        </p>
      </div>

      {loadError ? (
        <Alert tone="danger" role="alert" title="Operations data unavailable" className="mt-6">
          <p>{loadError}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => {
              setLoading(true);
              setLoadError(null);
              setReloadKey((key) => key + 1);
            }}
          >
            Try again
          </Button>
        </Alert>
      ) : null}

      <section aria-labelledby="departure-schedule" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="departure-schedule" className="flex items-center gap-2 text-2xl text-ink">
            <CalendarDays size={20} aria-hidden="true" className="text-brand-ink" />
            Departure schedule
          </h2>
          <button
            type="button"
            onClick={openClear}
            disabled={!selectedTour || selectedDates.length === 0 || savingDates}
            className="text-xs font-semibold text-danger underline-offset-4 hover:underline disabled:opacity-50"
          >
            Disable all dates
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
            <Field label="Journey" htmlFor="schedule-tour">
              <select
                id="schedule-tour"
                value={selectedTourId}
                onChange={(event) => {
                  setSelectedTourId(event.target.value);
                  setDateError(null);
                  setDateNotice(null);
                }}
                className={inputClasses()}
              >
                {tours.length === 0 ? <option value="">No journeys yet</option> : null}
                {tours.map((tour) => (
                  <option key={tour._id} value={tour._id}>
                    {tour.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="New departure" htmlFor="schedule-date">
              <input
                id="schedule-date"
                type="date"
                min={todayDateOnly()}
                value={dateInput}
                onChange={(event) => setDateInput(event.target.value)}
                className={inputClasses()}
              />
            </Field>

            <Button
              type="button"
              variant="primary"
              onClick={addDate}
              disabled={!selectedTour || savingDates}
              className="md:mb-0.5"
            >
              {savingDates ? (
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              ) : (
                <CalendarPlus size={16} aria-hidden="true" />
              )}
              Publish date
            </Button>
          </div>

          {dateError ? (
            <Alert tone="danger" role="alert" className="mt-4">
              {dateError}
            </Alert>
          ) : null}
          {dateNotice ? (
            <Alert
              tone={dateNotice.tone}
              role={dateNotice.tone === "warning" ? "alert" : "status"}
              title={dateNotice.title}
              className="mt-4"
            >
              {dateNotice.body}
            </Alert>
          ) : null}

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,22rem)_1fr]">
            <div>
              <p className="mb-2 text-sm font-semibold text-ink">Calendar</p>
              <MonthCalendar
                month={month}
                onMonthChange={setMonth}
                availableDates={selectedDates}
                selected={null}
                onSelect={toggleCalendarDate}
                mode="manage"
                disabled={!selectedTour || savingDates}
                idPrefix="schedule"
              />
              <p className="mt-2 text-[11px] leading-relaxed text-ink-subtle">
                Select a future day to publish it. Select a published day to review disabling
                it.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-ink">Published departures</h3>
              {selectedDates.length === 0 ? (
                <p className="mt-2 text-sm text-ink-muted">
                  None yet. Travellers cannot request this journey until a future date is
                  published.
                </p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {selectedDates.map((date) => {
                    const past = !isUpcoming(date);
                    return (
                      <li
                        key={date}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                          past
                            ? "border-line bg-surface-muted text-ink-subtle"
                            : "border-brand-line bg-brand-soft text-brand-ink",
                        )}
                      >
                        {formatDeparture(date, { withWeekday: true })}
                        {past ? <span className="font-normal">(past)</span> : null}
                        <button
                          type="button"
                          onClick={() => openDisable(date)}
                          disabled={savingDates}
                          aria-label={`Disable departure ${formatDeparture(date)}`}
                          className="rounded-full p-0.5 text-danger hover:bg-danger-soft disabled:opacity-50"
                        >
                          <Ban size={12} aria-hidden="true" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="requests-heading" className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="requests-heading" className="text-2xl text-ink">
              Booking requests
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {bookings.length === 0
                ? "No requests have been submitted."
                : `${counts.Pending} pending, ${counts.Confirmed} confirmed, ${counts.Rejected} rejected.`}
            </p>
          </div>

          <div role="group" aria-label="Filter requests by status" className="flex flex-wrap gap-1.5">
            {FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                aria-pressed={filter === item}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === item
                    ? "border-brand bg-brand text-on-brand"
                    : "border-line-strong bg-surface text-ink-muted hover:bg-surface-muted",
                )}
              >
                {item}
                <span className="ml-1.5 opacity-70">
                  {item === "All" ? bookings.length : counts[item] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <Field label="Search requests" htmlFor="request-search" className="w-full sm:max-w-sm">
            <div className="relative">
              <Search
                size={15}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle"
              />
              <input
                id="request-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Journey, traveller or reference"
                className={cn(inputClasses(), "pl-9")}
              />
            </div>
          </Field>

          <Field label="Sort by" htmlFor="request-sort" className="w-full sm:w-52">
            <select
              id="request-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className={inputClasses()}
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5">
          {filtered.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={
                bookings.length === 0
                  ? "No booking requests yet"
                  : query.trim().length > 0
                    ? "No requests match this search"
                    : `No ${filter === "All" ? "" : filter.toLowerCase()} requests`
              }
              description={
                bookings.length === 0
                  ? "Requests appear here as soon as a traveller submits a published departure."
                  : query.trim().length > 0
                    ? "Clear the search or change the status filter to see other requests."
                    : "Change the filter to see the other decisions."
              }
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-line">
                  <caption className="sr-only">
                    Booking requests with traveller, departure, status and available action
                  </caption>
                  <thead className="bg-surface-muted/70">
                    <tr>
                      {["Journey", "Traveller", "Departure", "Submitted", "Status", "Action"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className={cn(
                              "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-ink-subtle",
                              heading === "Action" && "text-right",
                            )}
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filtered.map((booking) => (
                      <tr key={booking._id} className="align-top">
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold text-ink">
                            {booking.tourTitle || "Journey"}
                          </p>
                          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-ink-subtle">
                            Ref {bookingRef(booking)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-sm text-ink-muted">
                          <p className="font-medium text-ink">{booking.userName || "Traveller"}</p>
                          <p className="text-xs">{booking.userEmail || "No email stored"}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-muted">
                          {formatDeparture(booking.startDate)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-muted">
                          {formatTimestamp(booking.createdAt) || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={booking.status} />
                          {booking.statusNote ? (
                            <p className="mt-1 max-w-[16rem] text-[11px] leading-relaxed text-ink-subtle">
                              {booking.statusNote}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDetail(booking)}
                              aria-label={`View request ${bookingRef(booking)}`}
                            >
                              <Eye size={14} aria-hidden="true" />
                              View
                            </Button>
                            {booking.status === "Pending" ? (
                              <div className="flex flex-col items-end gap-2 sm:flex-row sm:justify-end">
                                <Button
                                  size="sm"
                                  variant="accent"
                                  onClick={() => openDecision(booking, "Confirmed")}
                                >
                                  <CheckCircle2 size={14} aria-hidden="true" />
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => openDecision(booking, "Rejected")}
                                >
                                  <XCircle size={14} aria-hidden="true" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <p className="text-right text-xs text-ink-subtle">Decision final</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail ? `Request ${bookingRef(detail)}` : "Request"}
        description="The stored booking record, as operations sees it."
        footer={
          detail?.status === "Pending" ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
              <Button variant="secondary" onClick={() => openDecision(detail, "Rejected")}>
                <XCircle size={14} aria-hidden="true" />
                Reject
              </Button>
              <Button variant="accent" onClick={() => openDecision(detail, "Confirmed")}>
                <CheckCircle2 size={14} aria-hidden="true" />
                Confirm
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setDetail(null)}>
                Close
              </Button>
            </div>
          )
        }
      >
        {detail ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold text-ink">{detail.tourTitle || "Journey"}</p>
              <StatusBadge status={detail.status} />
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Traveller
                </dt>
                <dd className="mt-1 text-ink">{detail.userName || "Traveller"}</dd>
                <dd className="text-xs text-ink-muted">{detail.userEmail || "No email stored"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Departure
                </dt>
                <dd className="mt-1 text-ink">
                  {formatDeparture(detail.startDate, { withWeekday: true })}
                </dd>
                {detail.endDate ? (
                  <dd className="text-xs text-ink-muted">
                    Ends {formatDeparture(detail.endDate)}
                  </dd>
                ) : null}
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Requested price
                </dt>
                <dd className="mt-1 text-ink">
                  {typeof detail.totalPrice === "number"
                    ? formatCurrency(detail.totalPrice)
                    : "Not stored"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Submitted
                </dt>
                <dd className="mt-1 text-ink">{formatTimestamp(detail.createdAt) || "—"}</dd>
                {detail.statusUpdatedAt ? (
                  <dd className="text-xs text-ink-muted">
                    Decision {formatTimestamp(detail.statusUpdatedAt)}
                  </dd>
                ) : null}
              </div>
            </dl>
            {detail.statusNote ? (
              <div className="rounded-xl border border-line bg-surface-muted p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Operations note
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink">{detail.statusNote}</p>
              </div>
            ) : null}
            {detail.status === "Pending" ? (
              <Alert tone="info">
                This is a request, not a confirmed reservation. Your decision is final once
                saved.
              </Alert>
            ) : null}
          </div>
        ) : null}
      </Dialog>

      <Dialog
        open={Boolean(action)}
        onClose={closeAction}
        title={
          action?.kind === "decision"
            ? action.status === "Confirmed"
              ? "Confirm this request?"
              : "Reject this request?"
            : action?.kind === "disable-date"
              ? "Disable this departure?"
              : "Disable every departure?"
        }
        description={
          action?.kind === "decision"
            ? "The decision is final and is written to the booking record immediately."
            : "Existing requests are never deleted or rejected by this action."
        }
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeAction} disabled={acting}>
              Cancel
            </Button>
            <Button
              variant={action?.kind === "decision" && action.status === "Rejected" ? "danger" : "primary"}
              onClick={confirmAction}
              disabled={acting}
            >
              {acting ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : action?.kind === "decision" ? (
                action.status === "Confirmed" ? (
                  "Confirm request"
                ) : (
                  "Reject request"
                )
              ) : (
                "Disable date"
              )}
            </Button>
          </div>
        }
      >
        {action?.kind === "decision" ? (
          <div className="space-y-4">
            <dl className="space-y-2 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-muted">Journey</dt>
                <dd className="text-right font-semibold text-ink">{action.booking.tourTitle}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-muted">Traveller</dt>
                <dd className="text-right font-semibold text-ink">
                  {action.booking.userName || "Traveller"}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-muted">Departure</dt>
                <dd className="text-right font-semibold text-ink">
                  {formatDeparture(action.booking.startDate)}
                </dd>
              </div>
            </dl>
            <Field
              label="Note to traveller (optional)"
              htmlFor="decision-note"
              hint="Stored on the booking and shown to the traveller. Maximum 400 characters."
            >
              <textarea
                id="decision-note"
                rows={3}
                maxLength={400}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className={inputClasses()}
                placeholder="Optional context for this decision"
              />
            </Field>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-ink-muted">
            {action?.kind === "disable-date"
              ? `${formatDeparture(action.date, { withWeekday: true })} will no longer be requestable for ${selectedTour?.title}. Any Pending or Confirmed request on that date stays exactly as it is.`
              : `All ${selectedDates.length} published departure${selectedDates.length === 1 ? "" : "s"} for ${selectedTour?.title} will be removed from the public schedule. Existing requests remain.`}
          </p>
        )}

        {actionError ? (
          <Alert tone="danger" role="alert" className="mt-4">
            {actionError}
          </Alert>
        ) : null}
      </Dialog>
    </div>
  );
}
