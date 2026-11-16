"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CalendarPlus, Compass, Loader2, PlusCircle, Trash2 } from "lucide-react";

import {
  Alert,
  Button,
  Field,
  inputClasses,
  SectionHeading,
} from "@/components/ui";
import { ApiError, api } from "@/lib/api-client";
import { formatDeparture, formatCurrency, isUpcoming, todayDateOnly } from "@/lib/dates";

const INITIAL = {
  title: "",
  shortDesc: "",
  fullDesc: "",
  location: "",
  image: "",
  price: "",
  duration: "",
  priority: "Standard",
};

export default function AddTourForm() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [dates, setDates] = useState([]);
  const [dateInput, setDateInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  function addDate() {
    if (!dateInput) return;
    if (dateInput < todayDateOnly()) {
      setError("Departures must be today or later.");
      return;
    }
    if (dates.includes(dateInput)) {
      setError("That date is already in the list.");
      return;
    }
    setError(null);
    setDates((current) => [...current, dateInput].sort());
    setDateInput("");
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError(null);
    setDetails(null);

    const title = form.title.trim();
    const price = Number(form.price);
    const duration = Number(form.duration);

    if (!title) {
      setError("A journey title is required.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setError("Price must be a number of zero or more.");
      return;
    }
    if (!Number.isInteger(duration) || duration < 1 || duration > 365) {
      setError("Duration must be a whole number of days between 1 and 365.");
      return;
    }

    setSaving(true);
    try {
      await api.admin.createTour({
        title,
        shortDesc: form.shortDesc.trim() || undefined,
        fullDesc: form.fullDesc.trim() || undefined,
        location: form.location.trim() || undefined,
        image: form.image.trim() || undefined,
        price,
        duration,
        priority: form.priority,
        availableDates: dates,
      });
      router.push("/dashboard/manage");
      router.refresh();
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        setDetails(Array.isArray(cause.details) ? cause.details : null);
      } else {
        setError("The journey could not be created.");
      }
    } finally {
      setSaving(false);
    }
  }

  const priceNumber = Number(form.price);
  const showPrice = form.price !== "" && Number.isFinite(priceNumber);

  return (
    <div>
      <Link
        href="/dashboard/manage"
        className="text-sm font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline"
      >
        ← Back to inventory
      </Link>

      <div className="mt-4 max-w-2xl">
        <h1 className="text-3xl text-ink sm:text-4xl">Add a journey</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          Only the fields below are accepted by the API. Prices and durations are read
          from this stored record when a traveller requests a departure, so enter real
          values rather than placeholders.
        </p>
      </div>

      {error ? (
        <Alert tone="danger" role="alert" title="Journey not created" className="mt-6">
          <p>{error}</p>
          {details ? (
            <ul className="mt-2 list-inside list-disc text-xs">
              {details.map((item) => (
                <li key={String(item)}>{String(item)}</li>
              ))}
            </ul>
          ) : null}
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <SectionHeading title="The essentials" as="h2" className="[&>h2]:text-xl" />
            <div className="mt-5 space-y-5">
              <Field label="Title" htmlFor="tour-title" required>
                <input
                  id="tour-title"
                  value={form.title}
                  onChange={update("title")}
                  maxLength={160}
                  required
                  className={inputClasses()}
                  placeholder="e.g. 7-day Atlantic coast walk"
                />
              </Field>

              <Field
                label="Short description"
                htmlFor="tour-short"
                hint="Shown on catalogue cards. Maximum 400 characters; not a place for claims you cannot support."
              >
                <textarea
                  id="tour-short"
                  value={form.shortDesc}
                  onChange={update("shortDesc")}
                  maxLength={400}
                  rows={3}
                  className={inputClasses()}
                />
              </Field>

              <Field
                label="Full description / itinerary"
                htmlFor="tour-full"
                hint="Plain text. Line breaks are preserved on the journey page."
              >
                <textarea
                  id="tour-full"
                  value={form.fullDesc}
                  onChange={update("fullDesc")}
                  maxLength={20000}
                  rows={8}
                  className={inputClasses()}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <SectionHeading title="Logistics" as="h2" className="[&>h2]:text-xl" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Price in USD" htmlFor="tour-price" required>
                <input
                  id="tour-price"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  value={form.price}
                  onChange={update("price")}
                  required
                  className={inputClasses()}
                />
              </Field>

              <Field label="Duration in days" htmlFor="tour-duration" required>
                <input
                  id="tour-duration"
                  type="number"
                  min="1"
                  max="365"
                  step="1"
                  inputMode="numeric"
                  value={form.duration}
                  onChange={update("duration")}
                  required
                  className={inputClasses()}
                />
              </Field>

              <Field label="Location" htmlFor="tour-location">
                <input
                  id="tour-location"
                  value={form.location}
                  onChange={update("location")}
                  maxLength={160}
                  className={inputClasses()}
                  placeholder="Region or country"
                />
              </Field>

              <Field label="Category" htmlFor="tour-priority">
                <select
                  id="tour-priority"
                  value={form.priority}
                  onChange={update("priority")}
                  className={inputClasses()}
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="VIP">VIP</option>
                </select>
              </Field>

              <Field
                label="Cover image URL"
                htmlFor="tour-image"
                hint="Must be an absolute http(s) URL or a local path. Invalid URLs are ignored by the API."
                className="sm:col-span-2"
              >
                <input
                  id="tour-image"
                  type="url"
                  value={form.image}
                  onChange={update("image")}
                  className={inputClasses()}
                  placeholder="https://…"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <h2 className="text-xl text-ink">First departures (optional)</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Publish real future dates now, or leave this empty and add them from
              Requests &amp; departures. Nothing can be requested until a date exists.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <Field label="Departure date" htmlFor="tour-date" className="flex-1">
                <input
                  id="tour-date"
                  type="date"
                  min={todayDateOnly()}
                  value={dateInput}
                  onChange={(event) => setDateInput(event.target.value)}
                  className={inputClasses()}
                />
              </Field>
              <Button type="button" variant="secondary" onClick={addDate}>
                <CalendarPlus size={16} aria-hidden="true" />
                Add date
              </Button>
            </div>

            {dates.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {dates.map((date) => (
                  <li
                    key={date}
                    className="inline-flex items-center gap-2 rounded-full border border-lagoon-100 bg-lagoon-50 px-3 py-1.5 text-xs font-semibold text-lagoon-700"
                  >
                    {formatDeparture(date, { withWeekday: true })}
                    <button
                      type="button"
                      onClick={() => setDates((current) => current.filter((item) => item !== date))}
                      aria-label={`Remove ${formatDeparture(date)}`}
                      className="rounded-full p-0.5 text-danger hover:bg-danger-soft"
                    >
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs text-ink-subtle">No dates added yet.</p>
            )}
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/dashboard/manage"
              className="inline-flex items-center justify-center rounded-full border border-line-strong bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted"
            >
              Cancel
            </Link>
            <Button type="submit" variant="primary" size="lg" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={17} className="animate-spin" aria-hidden="true" />
                  Creating journey…
                </>
              ) : (
                <>
                  <PlusCircle size={17} aria-hidden="true" />
                  Create journey
                </>
              )}
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="relative aspect-[4/3] bg-sand-200">
              {form.image ? (
                <Image
                  src={form.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ocean-800 via-ocean-900 to-lagoon-700 text-white/70">
                  <Compass size={40} aria-hidden="true" />
                </div>
              )}
            </div>
            <div className="p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lagoon-700">
                Preview
              </p>
              <p className="mt-1 font-display text-xl text-ink">
                {form.title.trim() || "Untitled journey"}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {form.location.trim() || "Location not set"}
              </p>
              <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Price</dt>
                  <dd className="font-semibold text-ocean-900">
                    {showPrice ? formatCurrency(priceNumber) : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Duration</dt>
                  <dd className="font-semibold text-ink">
                    {form.duration ? `${form.duration} days` : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">Departures</dt>
                  <dd className="font-semibold text-ink">
                    {dates.filter((date) => isUpcoming(date)).length}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-line bg-surface-muted p-4 text-xs leading-relaxed text-ink-muted">
            The API re-validates every field: title ≤ 160 characters, price between 0
            and 1,000,000, duration 1–365 whole days, and image URLs limited to http(s).
          </div>
        </aside>
      </form>
    </div>
  );
}
