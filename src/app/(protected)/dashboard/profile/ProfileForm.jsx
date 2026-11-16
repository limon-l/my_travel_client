"use client";

import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import {
  Alert,
  Button,
  Field,
  inputClasses,
  LoadingState,
} from "@/components/ui";
import { ApiError, api } from "@/lib/api-client";

export default function ProfileForm({ userId }) {
  const [form, setForm] = useState({ name: "", email: "", hometown: "", dob: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.getProfile(userId);
        if (!active) return;
        setForm({
          name: data?.name || "",
          email: data?.email || "",
          hometown: data?.hometown || "",
          dob: typeof data?.dob === "string" ? data.dob : "",
        });
        setError(null);
      } catch (cause) {
        if (!active) return;
        setError(
          cause instanceof ApiError ? cause.message : "Your profile could not be loaded.",
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId, reloadKey]);

  async function onSubmit(event) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!form.name.trim()) {
      setError("Your name cannot be empty.");
      return;
    }
    if (form.dob && !/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) {
      setError("Date of birth must be a calendar date.");
      return;
    }

    setSaving(true);
    try {
      const updated = await api.updateProfile(userId, {
        name: form.name.trim(),
        hometown: form.hometown.trim(),
        dob: form.dob,
      });
      setForm((current) => ({
        ...current,
        name: updated?.name || current.name,
        hometown: updated?.hometown || "",
        dob: typeof updated?.dob === "string" ? updated.dob : "",
      }));
      setNotice("Profile saved.");
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Your profile could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading your profile…" />;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl text-ink sm:text-4xl">Profile</h1>
      <p className="mt-3 text-base leading-relaxed text-ink-muted">
        Your name, hometown and date of birth are stored on your account. Email is
        managed by the authentication layer and is shown read-only here.
      </p>

      {notice ? (
        <Alert tone="success" role="status" className="mt-6">
          {notice}
        </Alert>
      ) : null}

      {error ? (
        <Alert tone="danger" role="alert" title="Profile update failed" className="mt-6">
          <p>{error}</p>
          {error === "Your profile could not be loaded." ? (
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
          ) : null}
        </Alert>
      ) : null}

      <form onSubmit={onSubmit} className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="profile-name" required>
            <input
              id="profile-name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              maxLength={120}
              required
              autoComplete="name"
              className={inputClasses()}
            />
          </Field>

          <Field label="Email" htmlFor="profile-email" hint="Read-only.">
            <input
              id="profile-email"
              type="email"
              value={form.email}
              readOnly
              disabled
              autoComplete="email"
              className={`${inputClasses()} cursor-not-allowed bg-surface-muted text-ink-muted`}
            />
          </Field>

          <Field label="Hometown" htmlFor="profile-hometown">
            <input
              id="profile-hometown"
              value={form.hometown}
              onChange={(event) =>
                setForm((current) => ({ ...current, hometown: event.target.value }))
              }
              maxLength={120}
              autoComplete="address-level2"
              className={inputClasses()}
            />
          </Field>

          <Field label="Date of birth" htmlFor="profile-dob" hint="Calendar date, stored as YYYY-MM-DD.">
            <input
              id="profile-dob"
              type="date"
              value={form.dob}
              onChange={(event) => setForm((current) => ({ ...current, dob: event.target.value }))}
              className={inputClasses()}
            />
          </Field>
        </div>

        <div className="mt-6 flex justify-end border-t border-line pt-5">
          <Button type="submit" variant="primary" disabled={saving}>
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
      </form>
    </div>
  );
}
