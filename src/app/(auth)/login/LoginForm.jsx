"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { ArrowRight, Compass, Loader2, Lock, Mail } from "lucide-react";

import { Alert, Field, inputClasses } from "@/components/ui";

function safeCallback(value) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("/login")) return null;
  return value;
}

export default function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callbackUrl = safeCallback(searchParams.get("callbackUrl")) || "/dashboard";
  const registered = searchParams.get("registered") === "1";

  useEffect(() => {
    if (status === "authenticated") router.replace(callbackUrl);
  }, [status, router, callbackUrl]);

  async function onSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: form.email.trim(),
        password: form.password,
        callbackUrl,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Email or password is incorrect.");
        return;
      }

      router.replace(callbackUrl);
      router.refresh();
    } catch {
      setError("Sign-in could not be completed. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[1fr_0.9fr]">
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lagoon-700">
            Welcome back
          </p>
          <h1 className="mt-3 text-4xl leading-tight text-ink">Sign in</h1>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            Sign in to request published departures and follow the operations decision.
          </p>

          {registered ? (
            <Alert tone="success" role="status" className="mt-6">
              Account created. Sign in with the password you just chose.
            </Alert>
          ) : null}

          {error ? (
            <Alert tone="danger" role="alert" className="mt-6">
              {error}
            </Alert>
          ) : null}

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            <Field label="Email" htmlFor="login-email" required>
              <div className="relative">
                <Mail
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className={`${inputClasses()} pl-10`}
                  placeholder="you@example.com"
                />
              </div>
            </Field>

            <Field label="Password" htmlFor="login-password" required>
              <div className="relative">
                <Lock
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle"
                />
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  className={`${inputClasses()} pl-10`}
                  placeholder="Your password"
                />
              </div>
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ocean-900 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-ocean-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-ink-muted">
            No account yet?{" "}
            <Link
              href="/register"
              className="font-semibold text-lagoon-700 underline-offset-4 hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-ocean-950 lg:block">
        <div aria-hidden="true" className="absolute inset-0 hero-grain opacity-90" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lagoon-600">
              <Compass size={19} aria-hidden="true" />
            </span>
            <span className="font-display text-xl">Wanderlust Atlas</span>
          </div>

          <div className="max-w-sm">
            <p className="font-display text-3xl leading-snug">
              Requests are reviewed by people, and the decision is written down.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-sand-200">
              <li>Published departures only — the server rejects anything else.</li>
              <li>Pending, Confirmed and Rejected are the only statuses.</li>
              <li>No payment is collected anywhere in this product.</li>
            </ul>
          </div>

          <p className="text-xs text-sand-400">
            Wanderlust Atlas · availability-aware travel requests
          </p>
        </div>
      </div>
    </div>
  );
}
