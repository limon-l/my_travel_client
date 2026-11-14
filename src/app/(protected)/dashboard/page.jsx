import Link from "next/link";
import { ArrowRight, CalendarDays, ClipboardList, PlusCircle, Route } from "lucide-react";

import { Alert, SectionHeading, StatTile } from "@/components/ui";
import { backendFetch } from "@/lib/backend";
import { identityFromSession } from "@/lib/identity";
import { requireSession } from "@/lib/server-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Operations overview",
};

export default async function DashboardOverviewPage() {
  const session = await requireSession();
  if (session.user.role !== "admin") redirect("/dashboard/bookings");

  const identity = identityFromSession(session);
  let summary = null;
  let error = null;

  try {
    summary = await backendFetch("admin/summary", { identity, timeoutMs: 10000 });
  } catch (cause) {
    error = cause?.message || "The operations summary could not be loaded.";
  }

  return (
    <div>
      <div className="max-w-2xl">
        <h1 className="text-3xl text-ink sm:text-4xl">Operations overview</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          Counts below come straight from the booking and tour collections. Nothing is
          estimated or rounded up for presentation.
        </p>
      </div>

      {error ? (
        <Alert tone="danger" role="alert" title="Summary unavailable" className="mt-8">
          {error}
        </Alert>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatTile
            label="Pending requests"
            value={summary?.pending ?? 0}
            hint="Awaiting an operations decision"
            tone="warning"
          />
          <StatTile
            label="Confirmed"
            value={summary?.confirmed ?? 0}
            hint="Approved departures"
            tone="success"
          />
          <StatTile
            label="Rejected"
            value={summary?.rejected ?? 0}
            hint="Declined requests"
            tone="danger"
          />
          <StatTile
            label="Journeys"
            value={summary?.tours ?? 0}
            hint="In the catalogue"
            tone="lagoon"
          />
          <StatTile
            label="Active departures"
            value={summary?.activeDepartures ?? 0}
            hint="Published today or later"
          />
          <StatTile
            label="Upcoming confirmed"
            value={summary?.upcomingConfirmed ?? 0}
            hint="Confirmed with a future date"
          />
        </div>
      )}

      <div className="mt-12">
        <SectionHeading
          eyebrow="Next actions"
          title="Where to go from here"
          description="The same three operations you need to run the catalogue."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              href: "/dashboard/requests",
              icon: ClipboardList,
              title: "Review requests",
              body: "Confirm or reject Pending requests, and publish or disable departure dates.",
            },
            {
              href: "/dashboard/manage",
              icon: Route,
              title: "Manage journeys",
              body: "See every journey, its published departures, and remove an unused one.",
            },
            {
              href: "/dashboard/add",
              icon: PlusCircle,
              title: "Add a journey",
              body: "Create a new catalogue entry with honest pricing and duration.",
            },
          ].map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-2xl border border-line bg-surface p-6 transition-shadow hover:shadow-[0_20px_45px_-32px_rgba(13,41,51,0.5)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-lagoon-50 text-lagoon-700">
                <card.icon size={20} aria-hidden="true" />
              </span>
              <p className="mt-4 flex items-center gap-1.5 text-lg font-semibold text-ink">
                {card.title}
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="text-ink-subtle transition-transform group-hover:translate-x-0.5"
                />
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{card.body}</p>
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-10 flex items-start gap-2 rounded-xl border border-line bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-muted">
        <CalendarDays size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        Disabling a departure never deletes or rejects existing requests. The API
        reports affected bookings so the decision stays visible.
      </p>
    </div>
  );
}
