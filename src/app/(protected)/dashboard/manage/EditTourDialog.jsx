"use client";

import { useMemo, useState } from "react";
import { Loader2, Save, TriangleAlert } from "lucide-react";

import Dialog from "@/components/ui/Dialog";
import { Alert, Button, Field, inputClasses } from "@/components/ui";
import { ApiError, api } from "@/lib/api-client";
import { formatCurrency } from "@/lib/dates";
import { cn } from "@/lib/cn";

const PRIORITIES = ["Standard", "Premium", "VIP"];
const MAX_PRICE = 1_000_000;
const MAX_DURATION = 365;

const LIMITS = {
  title: 160,
  location: 160,
  shortDesc: 400,
  fullDesc: 20000,
};

function toForm(tour) {
  return {
    title: tour?.title || "",
    price: tour?.price === 0 || tour?.price ? String(tour.price) : "",
    duration: tour?.duration ? String(tour.duration) : "",
    location: tour?.location || "",
    shortDesc: tour?.shortDesc || "",
    fullDesc: tour?.fullDesc || "",
    image: tour?.image || "",
    priority: tour?.priority || "Standard",
  };
}

/**
 * Compares the edited form with the stored tour and returns only the fields that
 * actually changed. The API PATCH route only accepts the editable allowlist, so
 * `_id`, timestamps, status or any other stored field can never be sent.
 */
function buildPatch(original, form) {
  const patch = {};
  const baseline = toForm(original);

  for (const key of Object.keys(LIMITS)) {
    const next = String(form[key] ?? "").trim();
    if (next !== String(baseline[key] ?? "").trim()) patch[key] = next;
  }

  const price = form.price.trim();
  if (price !== baseline.price.trim()) patch.price = price === "" ? null : Number(price);

  const duration = form.duration.trim();
  if (duration !== baseline.duration.trim()) {
    patch.duration = duration === "" ? null : Number(duration);
  }

  if (form.priority !== baseline.priority) patch.priority = form.priority;

  return patch;
}

function validate(form) {
  const errors = {};

  const title = form.title.trim();
  if (!title) errors.title = "A journey title is required.";
  else if (title.length > LIMITS.title) errors.title = `Title must be ${LIMITS.title} characters or fewer.`;

  const price = Number(form.price);
  if (form.price.trim() === "" || !Number.isFinite(price)) {
    errors.price = "Enter a numeric price.";
  } else if (price < 0 || price > MAX_PRICE) {
    errors.price = `Price must be between 0 and ${MAX_PRICE.toLocaleString("en-GB")}.`;
  }

  const duration = Number(form.duration);
  if (form.duration.trim() === "" || !Number.isInteger(duration)) {
    errors.duration = "Duration must be a whole number of days.";
  } else if (duration < 1 || duration > MAX_DURATION) {
    errors.duration = `Duration must be between 1 and ${MAX_DURATION} days.`;
  }

  if (form.location.trim().length > LIMITS.location) {
    errors.location = `Location must be ${LIMITS.location} characters or fewer.`;
  }
  if (form.shortDesc.trim().length > LIMITS.shortDesc) {
    errors.shortDesc = `Summary must be ${LIMITS.shortDesc} characters or fewer.`;
  }
  if (form.fullDesc.trim().length > LIMITS.fullDesc) {
    errors.fullDesc = `Description must be ${LIMITS.fullDesc} characters or fewer.`;
  }

  const image = form.image.trim();
  if (image) {
    const isLocal = image.startsWith("/");
    const isHttp = /^https?:\/\/[^\s]+$/i.test(image);
    if (!isLocal && !isHttp) errors.image = "Use an https:// URL or a path that starts with /.";
  }

  if (!PRIORITIES.includes(form.priority)) errors.priority = "Choose a valid category.";

  return errors;
}

export default function EditTourDialog({ tour, open, onClose, onSaved }) {
  const [form, setForm] = useState(() => toForm(tour));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const patch = useMemo(() => buildPatch(tour, form), [tour, form]);
  const changedCount = Object.keys(patch).length;
  const durationChanged = Object.prototype.hasOwnProperty.call(patch, "duration");

  function update(field) {
    return (event) => {
      const value = event.target.value;
      setForm((current) => ({ ...current, [field]: value }));
      setFieldErrors((current) => {
        if (!current[field]) return current;
        const next = { ...current };
        delete next[field];
        return next;
      });
    };
  }

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setDetails(null);

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError("Please correct the highlighted fields.");
      return;
    }

    if (changedCount === 0) {
      setError("Nothing has changed yet.");
      return;
    }

    setSaving(true);
    try {
      const result = await api.updateTour(tour._id, patch);
      onSaved?.(result?.tour || { ...tour, ...patch });
      onClose?.();
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        if (Array.isArray(cause.details)) setDetails(cause.details.map(String));
      } else {
        setError("The journey could not be saved.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (!tour) return null;

  return (
    <Dialog
      open={open}
      onClose={saving ? () => {} : onClose}
      title={`Edit ${tour.title}`}
      description="Catalogue changes never rewrite an existing booking's stored title, image, price or dates."
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-subtle" role="status" aria-live="polite">
            {changedCount === 0
              ? "No changes yet"
              : `${changedCount} field${changedCount === 1 ? "" : "s"} will be updated`}
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="secondary" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving || changedCount === 0}>
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={16} aria-hidden="true" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error ? (
          <Alert tone="danger" role="alert">
            <p>{error}</p>
            {details && details.length > 0 ? (
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                {details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            ) : null}
          </Alert>
        ) : null}

        <Field label="Title" htmlFor="edit-title" error={fieldErrors.title}>
          <input
            id="edit-title"
            value={form.title}
            onChange={update("title")}
            maxLength={LIMITS.title}
            className={cn(inputClasses(), fieldErrors.title && "border-danger")}
            required
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Price (USD)"
            htmlFor="edit-price"
            error={fieldErrors.price}
            hint={`Stored price today: ${formatCurrency(tour.price)}`}
          >
            <input
              id="edit-price"
              type="number"
              min="0"
              max={MAX_PRICE}
              step="0.01"
              value={form.price}
              onChange={update("price")}
              className={cn(inputClasses(), fieldErrors.price && "border-danger")}
              required
            />
          </Field>

          <Field
            label="Duration (days)"
            htmlFor="edit-duration"
            error={fieldErrors.duration}
            hint="Applies to future requests only."
          >
            <input
              id="edit-duration"
              type="number"
              min="1"
              max={MAX_DURATION}
              step="1"
              value={form.duration}
              onChange={update("duration")}
              className={cn(inputClasses(), fieldErrors.duration && "border-danger")}
              required
            />
          </Field>
        </div>

        {durationChanged ? (
          <Alert tone="warning" role="status">
            <span className="inline-flex items-start gap-2">
              <TriangleAlert size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
              <span>
                Changing the duration affects departures requested after you save. Existing
                bookings keep their stored start and end dates.
              </span>
            </span>
          </Alert>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Location" htmlFor="edit-location" error={fieldErrors.location}>
            <input
              id="edit-location"
              value={form.location}
              onChange={update("location")}
              maxLength={LIMITS.location}
              className={cn(inputClasses(), fieldErrors.location && "border-danger")}
            />
          </Field>

          <Field label="Category" htmlFor="edit-priority" error={fieldErrors.priority}>
            <select
              id="edit-priority"
              value={form.priority}
              onChange={update("priority")}
              className={inputClasses()}
            >
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field
          label="Cover image"
          htmlFor="edit-image"
          error={fieldErrors.image}
          hint="An https:// URL or a local path such as /covers/coast.jpg. Leave blank to remove it."
        >
          <input
            id="edit-image"
            value={form.image}
            onChange={update("image")}
            className={cn(inputClasses(), fieldErrors.image && "border-danger")}
            placeholder="https://images.example.com/coast.jpg"
          />
        </Field>

        <Field label="Short summary" htmlFor="edit-short" error={fieldErrors.shortDesc}>
          <textarea
            id="edit-short"
            rows={2}
            value={form.shortDesc}
            onChange={update("shortDesc")}
            maxLength={LIMITS.shortDesc}
            className={cn(inputClasses(), fieldErrors.shortDesc && "border-danger")}
          />
        </Field>

        <Field label="Full description" htmlFor="edit-full" error={fieldErrors.fullDesc}>
          <textarea
            id="edit-full"
            rows={6}
            value={form.fullDesc}
            onChange={update("fullDesc")}
            maxLength={LIMITS.fullDesc}
            className={cn(inputClasses(), fieldErrors.fullDesc && "border-danger")}
          />
        </Field>
      </form>
    </Dialog>
  );
}
