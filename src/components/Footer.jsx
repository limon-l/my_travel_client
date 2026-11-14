import Link from "next/link";
import { Compass, Mail, MapPin } from "lucide-react";

const exploreLinks = [
  { label: "All destinations", href: "/tours" },
  { label: "How booking works", href: "/about#booking-model" },
  { label: "Contact the team", href: "/contact" },
];

const accountLinks = [
  { label: "Sign in", href: "/login" },
  { label: "Create account", href: "/register" },
  { label: "My trips", href: "/dashboard/bookings" },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ocean-800 bg-ocean-950 text-sand-200">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-lagoon-600 text-white">
              <Compass size={18} aria-hidden="true" />
            </span>
            <span className="font-display text-xl text-white">Wanderlust Atlas</span>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-sand-300">
            An availability-aware travel booking platform. Departures are
            published by operations, requests are reviewed by people, and every
            status you see reflects the stored booking record.
          </p>
          <p className="mt-4 max-w-md rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-relaxed text-sand-300">
            This is an independently built portfolio product. Tour photography is
            sourced from third-party providers and pricing is illustrative.
          </p>
        </div>

        <nav aria-label="Explore">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-400">
            Explore
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sand-200 underline-offset-4 hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-sand-400">
            Account
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sand-200 underline-offset-4 hover:text-white hover:underline">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-sand-400">
            Reach us
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-sand-300">
            <li className="flex items-center gap-2">
              <Mail size={14} aria-hidden="true" />
              <a href="mailto:hello@wanderlust.example" className="underline-offset-4 hover:text-white hover:underline">
                hello@wanderlust.example
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} aria-hidden="true" />
              Remote-first team
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-sand-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Wanderlust Atlas. Portfolio project.</p>
          <p>Next.js · React · NextAuth · Express · MongoDB</p>
        </div>
      </div>
    </footer>
  );
}
