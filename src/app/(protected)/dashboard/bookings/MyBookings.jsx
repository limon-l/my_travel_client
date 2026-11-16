"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Loader2, MapPinned, XCircle } from "lucide-react";

import BookingTimeline from "@/components/BookingTimeline";
import StatusBadge from "@/components/StatusBadge";
import Dialog from "@/components/ui/Dialog";
import { Alert, Button, ButtonLink, EmptyState, LoadingState } from "@/components/ui";
import { ApiError, api } from "@/lib/api-client";
import { formatCurrency, formatDeparture, formatTimestamp } from "@/lib/dates";
import { statusMeta } from "@/lib/booking-status";

export default function MyBookings({ userId }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.listBookings(userId);
        if (!active) return;
        setBookings(Array.isArray(data) ? data : []);
        setError(null);
      } catch (cause) {
        if (!active) return;
        setError(
          cause instanceof ApiError ? cause.message : "Your requests could not be loaded.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  async function cancelRequest() {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await api.cancelBooking(cancelTarget._id);
      setBookings((current) => current.filter((booking) => booking._id !== cancelTarget._id));
      setNotice(
        "Pending request withdrawn. It has been removed from the operations queue.",
      );
      setCancelTarget(null);
    } catch (cause) {
      setCancelError(
        cause instanceof ApiError ? cause.message : "The request could not be withdrawn.",
      );
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <LoadingState label="Loading your requests…" />;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl text-ink sm:text-4xl">My trips</h1>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Every request you have submitted, with the decision exactly as operations
            stored it. Only a Pending request can be withdrawn.
          </p>
        </div>
        <ButtonLink href="/tours" variant="secondary" className="self-start">
          Find another journey
        </ButtonLink>
      </div>

      {notice ? (
        <Alert tone="success" role="status" className="mt-6">
          {notice}
        </Alert>
      ) : null}

      {error ? (
        <Alert tone="danger" role="alert" title="Requests unavailable" className="mt-6">
          <p>{error}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadKey((key) => key + 1);
            }}
          >
            Try again
          </Button>
        </Alert>
      ) : null}

      <div className="mt-8">
        {!error && bookings.length === 0 ? (
          <EmptyState
            icon={MapPinned}
            title="No requests yet"
            description="Browse the atlas and send a request for a published departure. Nothing is booked until operations confirms it."
            action={
              <ButtonLink href="/tours" variant="primary">
                Browse departures
              </ButtonLink>
            }
          />
        ) : (
          <ul className="space-y-5">
            {bookings.map((booking) => {
              const meta = statusMeta(booking.status);
              const isPending = booking.status === "Pending";
              return (
                <li
                  key={booking._id}
                  className="overflow-hidden rounded-2xl border border-line bg-surface"
                >
                  <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={booking.status} />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-ink-subtle">
                          Ref {String(booking._id).slice(-8).toUpperCase()}
                        </span>
                      </div>
                      <h2 className="mt-2 text-xl text-ink">
                        {booking.tourTitle || booking.tour?.title || "Journey"}
                      </h2>
                      <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} aria-hidden="true" />
                          {formatDeparture(booking.startDate)}
                          {booking.endDate ? ` → ${formatDeparture(booking.endDate)}` : ""}
                        </span>
                        <span>
                          Requested {formatTimestamp(booking.createdAt) || "date unavailable"}
                        </span>
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                        Listed price
                      </p>
                      <p className="text-lg font-semibold text-ocean-900">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                      {isPending ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setCancelError(null);
                            setCancelTarget(booking);
                          }}
                        >
                          <XCircle size={14} aria-hidden="true" />
                          Withdraw request
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-[1fr_1.2fr]">
                    <div>
                      <p className="text-sm leading-relaxed text-ink-muted">
                        {meta.longDescription}
                      </p>
                      {booking.statusNote ? (
                        <p className="mt-3 rounded-lg border border-line bg-surface-muted px-3 py-2 text-xs leading-relaxed text-ink-muted">
                          <span className="font-semibold text-ink">Operations note: </span>
                          {booking.statusNote}
                        </p>
                      ) : null}
                      {booking.tour?._id ? (
                        <Link
                          href={`/tours/${booking.tour._id}`}
                          className="mt-3 inline-block text-sm font-semibold text-lagoon-700 underline-offset-4 hover:underline"
                        >
                          View journey
                        </Link>
                      ) : null}
                    </div>
                    <BookingTimeline booking={booking} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog
        open={Boolean(cancelTarget)}
        onClose={() => (cancelling ? null : setCancelTarget(null))}
        title="Withdraw this request?"
        description="The pending request is deleted from the operations queue. This cannot be undone."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setCancelTarget(null)}
              disabled={cancelling}
            >
              Keep request
            </Button>
            <Button variant="danger" onClick={cancelRequest} disabled={cancelling}>
              {cancelling ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Withdrawing…
                </>
              ) : (
                "Withdraw request"
              )}
            </Button>
          </div>
        }
      >
        {cancelTarget ? (
          <dl className="space-y-2 text-sm">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-ink-muted">Journey</dt>
              <dd className="text-right font-semibold text-ink">
                {cancelTarget.tourTitle || cancelTarget.tour?.title}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-ink-muted">Departure</dt>
              <dd className="text-right font-semibold text-ink">
                {formatDeparture(cancelTarget.startDate)}
              </dd>
            </div>
          </dl>
        ) : null}
        {cancelError ? (
          <Alert tone="danger" role="alert" className="mt-4">
            {cancelError}
          </Alert>
        ) : null}
      </Dialog>
    </div>
  );
}
