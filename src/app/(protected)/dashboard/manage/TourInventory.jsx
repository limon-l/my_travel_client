"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Compass, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";

import EditTourDialog from "./EditTourDialog";
import Dialog from "@/components/ui/Dialog";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  EmptyState,
  Field,
  inputClasses,
  LoadingState,
} from "@/components/ui";
import { ApiError, api } from "@/lib/api-client";
import { formatCurrency, isUpcoming } from "@/lib/dates";

export default function TourInventory() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [notice, setNotice] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.listTours();
        if (!active) return;
        setTours(Array.isArray(data) ? data : []);
        setError(null);
      } catch (cause) {
        if (!active) return;
        setError(
          cause instanceof ApiError ? cause.message : "The journey inventory could not be loaded.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tours;
    return tours.filter((tour) =>
      `${tour.title || ""} ${tour.location || ""}`.toLowerCase().includes(needle),
    );
  }, [tours, query]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.admin.deleteTour(deleteTarget._id);
      setTours((current) => current.filter((tour) => tour._id !== deleteTarget._id));
      setNotice(`"${deleteTarget.title}" was deleted from the catalogue.`);
      setDeleteTarget(null);
    } catch (cause) {
      setDeleteError(
        cause instanceof ApiError ? cause.message : "The journey could not be deleted.",
      );
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingState label="Loading the catalogue…" />;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl text-ink sm:text-4xl">Journey inventory</h1>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Every catalogue entry, its stored price and duration, and how many future
            departures are published. Deletion is blocked while Pending or Confirmed
            requests reference a journey.
          </p>
        </div>
        <ButtonLink href="/dashboard/add" variant="primary" className="self-start">
          <Plus size={16} aria-hidden="true" />
          Add journey
        </ButtonLink>
      </div>

      {notice ? (
        <Alert tone="success" role="status" className="mt-6">
          {notice}
        </Alert>
      ) : null}

      {error ? (
        <Alert tone="danger" role="alert" title="Inventory unavailable" className="mt-6">
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

      <div className="mt-8 max-w-sm">
        <Field label="Search journeys" htmlFor="inventory-search">
          <div className="relative">
            <Search
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
            />
            <input
              id="inventory-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title or location"
              className={`${inputClasses()} pl-10`}
            />
          </div>
        </Field>
      </div>

      <p className="mt-4 text-sm text-ink-muted" role="status" aria-live="polite">
        {error ? "" : `${filtered.length} of ${tours.length} journeys shown`}
      </p>

      <div className="mt-4">
        {!error && filtered.length === 0 ? (
          <EmptyState
            icon={Compass}
            title={tours.length === 0 ? "The catalogue is empty" : "No journeys match that search"}
            description={
              tours.length === 0
                ? "Add the first journey to start publishing departures."
                : "Try a different title or location."
            }
            action={
              tours.length === 0 ? (
                <ButtonLink href="/dashboard/add" variant="primary">
                  Add a journey
                </ButtonLink>
              ) : (
                <Button variant="secondary" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-line">
                <caption className="sr-only">Published journey inventory</caption>
                <thead className="bg-surface-muted/70">
                  <tr>
                    {["Journey", "Category", "Price", "Duration", "Departures", "Actions"].map(
                      (heading) => (
                        <th
                          key={heading}
                          scope="col"
                          className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-ink-subtle ${
                            heading === "Actions" ? "text-right" : ""
                          }`}
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {filtered.map((tour) => {
                    const departures = Array.isArray(tour.availableDates)
                      ? tour.availableDates.filter((date) => isUpcoming(date)).length
                      : 0;
                    return (
                      <tr key={tour._id}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative hidden h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-muted sm:block">
                              {tour.image ? (
                                <Image
                                  src={tour.image}
                                  alt=""
                                  fill
                                  sizes="44px"
                                  className="object-cover"
                                />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-ink-subtle">
                                  <Compass size={16} aria-hidden="true" />
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/tours/${tour._id}`}
                                className="block truncate text-sm font-semibold text-ink underline-offset-4 hover:underline"
                              >
                                {tour.title}
                              </Link>
                              <p className="truncate text-xs text-ink-muted">
                                {tour.location || "No location set"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={tour.priority === "VIP" ? "lagoon" : "neutral"}>
                            {tour.priority || "Standard"}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink">
                          {formatCurrency(tour.price)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-muted">
                          {Number(tour.duration) > 0 ? `${tour.duration} days` : "Not set"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-ink-muted">
                          {departures}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditTarget(tour)}
                              aria-label={`Edit ${tour.title}`}
                            >
                              <Pencil size={16} aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeleteError(null);
                                setDeleteTarget(tour);
                              }}
                              aria-label={`Delete ${tour.title}`}
                              className="text-danger hover:bg-danger-soft"
                            >
                              <Trash2 size={16} aria-hidden="true" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => (deleting ? null : setDeleteTarget(null))}
        title="Delete this journey?"
        description="The catalogue entry and its published dates are removed. Requests that reference it are not affected."
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Keep journey
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Deleting…
                </>
              ) : (
                "Delete journey"
              )}
            </Button>
          </div>
        }
      >
        {deleteTarget ? (
          <p className="text-sm leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">{deleteTarget.title}</span> will be
            removed from the catalogue. The API refuses deletion while Pending or
            Confirmed requests exist, so this action cannot erase active demand.
          </p>
        ) : null}
        {deleteError ? (
          <Alert tone="danger" role="alert" className="mt-4">
            {deleteError}
          </Alert>
        ) : null}
      </Dialog>

      <EditTourDialog
        key={editTarget?._id}
        tour={editTarget}
        open
        onClose={() => setEditTarget(null)}
        onSaved={(updated) => {
          setTours((current) =>
            current.map((tour) => (tour._id === updated._id ? { ...tour, ...updated } : tour)),
          );
          setNotice(`"${updated.title}" was updated. Existing booking snapshots were not changed.`);
        }}
      />
    </div>
  );
}
