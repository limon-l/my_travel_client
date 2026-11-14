"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { Alert, Field, inputClasses } from "@/components/ui";
import { ApiError, api } from "@/lib/api-client";

const INITIAL = {
  name: "",
  email: "",
  dob: "",
  hometown: "",
  password: "",
  confirmPass: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState(null);

  function update(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setError(null);
    setDetails(null);

    if (!form.name.trim()) {
      setError("Your full name is required.");
      return;
    }
    if (form.password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    if (form.password !== form.confirmPass) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        dob: form.dob,
        hometown: form.hometown.trim(),
        password: form.password,
      });
    } catch (cause) {
      if (cause instanceof ApiError) {
        setError(cause.message);
        setDetails(Array.isArray(cause.details) ? cause.details : null);
      } else {
        setError("Registration could not be completed. Please retry.");
      }
      setLoading(false);
      return;
    }

    // Sign in with the credentials that were just accepted. If that extra step
    // fails, the account still exists and the traveller can sign in manually.
    try {
      const result = await signIn("credentials", {
        email: form.email.trim(),
        password: form.password,
        redirect: false,
      });
      if (result?.ok) {
        router.replace("/dashboard");
        router.refresh();
        return;
      }
    } catch {
      // Fall through to the sign-in page.
    }

    router.push("/login?registered=1");
    setLoading(false);
  }

  return (
    <div className="px-4 py-12 sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lagoon-700">
            Create an account
          </p>
          <h1 className="mt-3 text-4xl leading-tight text-ink">Start requesting</h1>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-muted">
            An account ties every request to you so operations can review it and you can
            see the decision. Browsing the atlas never requires an account.
          </p>

          {error ? (
            <Alert tone="danger" role="alert" title="Account not created" className="mt-6">
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

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Full name" htmlFor="register-name" required>
              <input
                id="register-name"
                required
                autoComplete="name"
                maxLength={120}
                value={form.name}
                onChange={update("name")}
                className={inputClasses()}
              />
            </Field>

            <Field label="Email" htmlFor="register-email" required>
              <input
                id="register-email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={update("email")}
                className={inputClasses()}
                placeholder="you@example.com"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Date of birth" htmlFor="register-dob">
                <input
                  id="register-dob"
                  type="date"
                  value={form.dob}
                  onChange={update("dob")}
                  className={inputClasses()}
                />
              </Field>
              <Field label="Hometown" htmlFor="register-hometown">
                <input
                  id="register-hometown"
                  maxLength={120}
                  value={form.hometown}
                  onChange={update("hometown")}
                  className={inputClasses()}
                  placeholder="City"
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Password"
                htmlFor="register-password"
                hint="At least 8 characters."
                required
              >
                <input
                  id="register-password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={update("password")}
                  className={inputClasses()}
                />
              </Field>
              <Field label="Confirm password" htmlFor="register-confirm" required>
                <input
                  id="register-confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={form.confirmPass}
                  onChange={update("confirmPass")}
                  className={inputClasses()}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ocean-900 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-muted">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-semibold text-lagoon-700 underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <aside className="rounded-2xl border border-line bg-surface p-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-ink">
            <ShieldCheck size={16} aria-hidden="true" className="text-lagoon-700" />
            What happens with your account
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
            <li>The API hashes your password; this browser never stores it.</li>
            <li>Your role is assigned by the server. It cannot be chosen here.</li>
            <li>Requests are attributed to your account by a signed server token.</li>
            <li>No payment details are requested at any point.</li>
          </ul>
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-subtle">
            This is a portfolio product. Use a password you do not reuse elsewhere.
          </p>
        </aside>
      </div>
    </div>
  );
}
