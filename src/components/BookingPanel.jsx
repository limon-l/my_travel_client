"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CalendarDays, CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";

import DeparturePicker from "@/components/DeparturePicker";
import MonthCalendar from "@/components/MonthCalendar";
import StatusBadge from "@/components/StatusBadge";
import Dialog from "@/components/ui/Dialog";
import { Alert, Button, ButtonLink } from "@/components/ui";
import { ApiError, api, bookingRequestId } from "@/lib/api-client";
import {
  addDaysDateOnly,
  formatCurrency,
  formatDeparture,
  isUpcoming,
  monthKeyOf,
  nightsBetween,
  todayMonthKey,
} from "@/lib/dates";
import { isAdminSession } from "@/lib/roles";
import { statusMeta } from "@/lib/booking-status";

/**
 * The complete request flow:
 * choose a published departure → review the request → submit → see Pending.
 * No payment step is implied because no payment integration exists.
 */
export default function BookingPanel({ tour, initialAvailableDates = [], existingBooking = null }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [availableDates, setAvailableDates] = useState(initialAvailableDates);
  const [loadingDates, setLoadingDates] = useState(initialAvailableDates.length === 0);
  const [datesError, setDatesError] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [datesReloadKey, setDatesReloadKey] = useState(0);
  const [view, setView] = useState("calendar");
  const [month, setMonth] = useState(todayMonthKey());
  const [reviewOpen, setReviewOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmed, setConfirmed] = useState(null);
  const requestIdRef = useRef(null);

  const isAdmin = isAdminSession(session);
  const isSignedIn = status === "authenticated";

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getAvailableDates(tour._id);
        if (!active) return;
        const list = Array.isArray(data?.availableDates) ? data.availableDates : [];
        setAvailableDates(list);
        setSelectedDate((current) => (list.includes(current) ? current : ""));
        // If the visible month has no departures, move to the first month that does.
        const upcomingList = list.filter((date) => isUpcoming(date)).sort();
        if (upcomingList.length > 0) {
          setMonth((current) => {
            const hasInMonth = upcomingList.some((date) => monthKeyOf(date) === current);
            return hasInMonth ? current : monthKeyOf(upcomingList[0]);
          });
        }
        setDatesError(null);
      } catch (error) {
        if (!active) return;
        setDatesError(
          error instanceof ApiError
            ? error.message
            : "Departures could not be loaded right now.",
        );
      } finally {
        if (active) setLoadingDates(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [tour._id, datesReloadKey]);

  function refreshDates() {
    setLoadingDates(true);
    setDatesError(null);
    setDatesReloadKey((key) => key + 1);
  }

  const upcoming = availableDates.filter((date) => isUpcoming(date));
  const returnDate = selectedDate
    ? addDaysDateOnly(selectedDate, Number(tour.duration) || 0)
    : null;
  const nights = returnDate
    ? nightsBetween(`${selectedDate}T00:00:00Z`, `${returnDate}T00:00:00Z`)
    : null;

  function openReview() {
    if (!selectedDate) return;
    // One idempotency key per review intent; retries of the same intent reuse it.
    requestIdRef.current = bookingRequestId();
    setSubmitError(null);
    setReviewOpen(true);
  }

  async function submitRequest() {
    if (!selectedDate) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await api.createBooking({
        tourId: tour._id,
        startDate: selectedDate,
        requestId: requestIdRef.current,
      });
      setConfirmed(result.booking);
      setReviewOpen(false);
      setSelectedDate("");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
          return;
        }
        if (error.status === 409) {
          setSubmitError(error.message);
          refreshDates();
          return;
        }
        setSubmitError(error.message);
        return;
      }
      setSubmitError("The request could not be sent. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isAdmin) {
    return (
      <div className="rounded-2xl border border-brand-line bg-brand-soft p-5">
        <p className="text-sm font-semibold text-brand-ink">Operations view</p>
        <p className="mt-1 text-sm text-ink-muted">
          Admins schedule departures rather than requesting them.
        </p>
        <ButtonLink
          href={`/dashboard/requests?tourId=${tour._id}`}
          variant="accent"
          className="mt-4 w-full"
        >
          <CalendarDays size={16} aria-hidden="true" />
          Manage departure dates
        </ButtonLink>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-5 text-sm text-ink-muted">
        <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        Loading your booking context…
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Lock size={15} aria-hidden="true" />
          Sign in to request this departure
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          You can browse freely. Signing in lets us attach the request to your
          account and show you the decision.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <ButtonLink
            href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
            variant="primary"
            className="flex-1"
          >
            Sign in
          </ButtonLink>
          <ButtonLink href="/register" variant="secondary" className="flex-1">
            Create account
          </ButtonLink>
        </div>
      </div>
    );
  }

  if (existingBooking) {
    const meta = statusMeta(existingBooking.status);
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          Your request
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status={existingBooking.status} />
          <span className="text-sm font-semibold text-ink">
            {formatDeparture(existingBooking.startDate)}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{meta.longDescription}</p>
        <ButtonLink href="/dashboard/bookings" variant="secondary" className="mt-4 w-full">
          View request status
        </ButtonLink>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="rounded-2xl border border-success-line bg-success-soft p-5" role="status">
        <p className="flex items-center gap-2 text-sm font-semibold text-success">
          <CheckCircle2 size={17} aria-hidden="true" />
          Request submitted — pending review
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {confirmed.tourTitle} · {formatDeparture(confirmed.startDate)}. This is
          not confirmed yet; operations will review the departure.
        </p>
        <p className="mt-1 text-xs text-ink-subtle">
          Reference {String(confirmed._id).slice(-8).toUpperCase()}
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <ButtonLink href="/dashboard/bookings" variant="primary" className="w-full">
            Track this request
          </ButtonLink>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setConfirmed(null);
              refreshDates();
            }}
          >
            Request another departure
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="font-display text-lg text-ink">Request this journey</p>
        <span className="text-sm font-semibold text-brand-ink">
          {formatCurrency(tour.price)}
        </span>
      </div>

      <div className="mt-4">
        {!loadingDates && !datesError && upcoming.length > 0 ? (
          <div className="mb-3 inline-flex rounded-full border border-line bg-surface-muted p-0.5 text-xs font-semibold">
            {[
              { value: "calendar", label: "Calendar" },
              { value: "list", label: "List" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={view === option.value}
                onClick={() => setView(option.value)}
                className={
                  view === option.value
                    ? "rounded-full bg-surface px-3 py-1 text-ink shadow-sm"
                    : "rounded-full px-3 py-1 text-ink-muted hover:text-ink"
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}

        {loadingDates || datesError || upcoming.length === 0 ? (
          <DeparturePicker
            departures={upcoming}
            selected={selectedDate}
            onSelect={setSelectedDate}
            durationDays={tour.duration}
            loading={loadingDates}
            error={datesError}
            onRetry={refreshDates}
            price={tour.price}
          />
        ) : view === "calendar" ? (
          <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            availableDates={upcoming}
            selected={selectedDate}
            onSelect={setSelectedDate}
            idPrefix={`departure-${tour._id}`}
          />
        ) : (
          <DeparturePicker
            departures={upcoming}
            selected={selectedDate}
            onSelect={setSelectedDate}
            durationDays={tour.duration}
            loading={loadingDates}
            error={datesError}
            onRetry={refreshDates}
            price={tour.price}
          />
        )}
      </div>

      {selectedDate ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-line bg-brand-soft px-3 py-2 text-xs text-brand-ink">
          <span className="font-semibold">
            {formatDeparture(selectedDate, { withWeekday: true })}
          </span>
          <span>
            {nights ? `${nights} nights` : "Duration set by operations"}
            {returnDate ? ` · returns ${formatDeparture(returnDate)}` : ""}
          </span>
        </div>
      ) : null}

      {submitError ? (
        <Alert tone="danger" role="alert" className="mt-4">
          {submitError}
        </Alert>
      ) : null}

      <Button
        variant="accent"
        size="lg"
        className="mt-4 w-full"
        disabled={!selectedDate || loadingDates || upcoming.length === 0}
        onClick={openReview}
      >
        Review request
      </Button>

      <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-subtle">
        <ShieldCheck size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
        Submitting creates a request in Pending state. Nothing is charged and no
        payment is collected in this product.
      </p>

      <Dialog
        open={reviewOpen}
        onClose={() => (submitting ? null : setReviewOpen(false))}
        title="Review your request"
        description="Check the departure and dates before sending."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setReviewOpen(false)} disabled={submitting}>
              Back
            </Button>
            <Button variant="accent" onClick={submitRequest} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Sending request…
                </>
              ) : (
                "Send request"
              )}
            </Button>
          </div>
        }
      >
        <dl className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4">
            <dt className="text-ink-muted">Tour</dt>
            <dd className="text-right font-semibold text-ink">{tour.title}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-ink-muted">Departure</dt>
            <dd className="text-right font-semibold text-ink">
              {formatDeparture(selectedDate, { withWeekday: true })}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="text-ink-muted">Return</dt>
            <dd className="text-right font-semibold text-ink">
              {returnDate ? formatDeparture(returnDate) : "—"}
              {nights ? <span className="block text-xs font-normal text-ink-muted">{nights} nights</span> : null}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 border-t border-line pt-3">
            <dt className="text-ink-muted">Listed price</dt>
            <dd className="text-right font-semibold text-brand-ink">{formatCurrency(tour.price)}</dd>
          </div>
        </dl>

        {submitError ? (
          <Alert tone="danger" role="alert" className="mt-4">
            {submitError}
          </Alert>
        ) : null}

        <Alert tone="info" className="mt-4">
          This sends a booking <strong>request</strong>. It stays Pending until
          operations approves or declines it, and this product does not process
          payments.
        </Alert>
      </Dialog>
    </div>
  );
}
