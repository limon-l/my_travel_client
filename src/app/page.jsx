import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  Compass,
  FileCheck2,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import TourCard from "@/components/TourCard";
import { Alert, Badge, ButtonLink, Container, EmptyState, SectionHeading } from "@/components/ui";
import { featuredTours, loadTours, upcomingDates } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

const STEPS = [
  {
    icon: Compass,
    title: "Choose a published departure",
    body: "Operations publishes real calendar dates per journey. If a date is not published, it cannot be requested — there is no sold-out theatre.",
  },
  {
    icon: FileCheck2,
    title: "Send a request, not a payment",
    body: "Your request is stored as Pending. This product does not collect card details or charge you at any point.",
  },
  {
    icon: CalendarCheck2,
    title: "Read the real decision",
    body: "A coordinator reviews the request and the status becomes Confirmed or Rejected. The timeline shows the stored record, never a guess.",
  },
];

export default async function HomePage() {
  const { data: tours, error } = await loadTours();
  const featured = featuredTours(tours, 6);
  const publishedDepartures = tours.reduce(
    (total, tour) => total + upcomingDates(tour).length,
    0,
  );

  return (
    <>
      <section className="relative overflow-hidden bg-ocean-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 hero-grain opacity-90" />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(26,119,118,0.35),transparent_55%)]"
        />

        <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div className="reveal">
            <Badge tone="onDark" className="backdrop-blur">
              <Sparkles size={13} aria-hidden="true" />
              Availability-aware travel
            </Badge>

            <h1 className="mt-6 text-balance font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Journeys chosen by people.
              <span className="block text-lagoon-200">Decisions you can see.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-sand-200 sm:text-lg">
              Wanderlust Atlas publishes real departures, records every request as
              Pending, and shows the operations decision exactly as it is stored.
              No invented reviews, no fake scarcity, no hidden payment step.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/tours" variant="accent" size="lg">
                Browse departures
                <ArrowRight size={18} aria-hidden="true" />
              </ButtonLink>
              <Link
                href="/about#booking-model"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                How requests work
              </Link>
            </div>

            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-sand-300">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              Booking requests are tied to your signed-in account and reviewed by
              operations. Nothing is charged in this product.
            </p>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur-md sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-lagoon-200">
                Live catalogue
              </p>

              {error ? (
                <div className="mt-4">
                  <Alert tone="warning" role="alert" title="Catalogue temporarily unavailable">
                    {error}
                  </Alert>
                </div>
              ) : (
                <>
                  <dl className="mt-5 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/12 bg-ocean-900/50 p-4">
                      <dt className="text-xs font-medium uppercase tracking-wide text-sand-300">
                        Journeys
                      </dt>
                      <dd className="mt-1 font-display text-4xl text-white">{tours.length}</dd>
                    </div>
                    <div className="rounded-2xl border border-white/12 bg-ocean-900/50 p-4">
                      <dt className="text-xs font-medium uppercase tracking-wide text-sand-300">
                        Published departures
                      </dt>
                      <dd className="mt-1 font-display text-4xl text-white">
                        {publishedDepartures}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs leading-relaxed text-sand-300">
                    These figures are read from the API on each visit. They are not
                    marketing totals.
                  </p>
                </>
              )}

              <div className="mt-6 border-t border-white/12 pt-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  <MapPin size={15} aria-hidden="true" className="text-sunset-500" />
                  Every departure is a calendar date
                </p>
                <p className="mt-2 text-xs leading-relaxed text-sand-300">
                  Dates are stored as YYYY-MM-DD and compared in UTC, so an operator
                  and a traveller see the same day.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="promises-heading" className="border-b border-line bg-surface">
        <Container className="py-10">
          <h2 id="promises-heading" className="sr-only">
            What makes this different
          </h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {[
              {
                title: "Published dates only",
                body: "The API rejects any departure that operations has not published.",
              },
              {
                title: "A human decision",
                body: "Requests stay Pending until a coordinator confirms or rejects them.",
              },
              {
                title: "No payment taken",
                body: "There is no checkout or card form in this product, by design.",
              },
            ].map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
                  <ShieldCheck size={17} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="featured-heading" className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              id="featured-heading"
              eyebrow="The atlas"
              title="Featured journeys"
              description="Ordered by the number of published departures, so what you can actually request appears first."
            />
            <ButtonLink href="/tours" variant="secondary" className="self-start sm:self-auto">
              View all journeys
              <ArrowRight size={16} aria-hidden="true" />
            </ButtonLink>
          </div>

          <div className="mt-10">
            {error ? (
              <Alert tone="warning" role="alert" title="Journeys could not be loaded">
                {error} The catalogue will reappear when the API is reachable.
              </Alert>
            ) : featured.length === 0 ? (
              <EmptyState
                icon={Compass}
                title="No journeys published yet"
                description="Operations has not added a journey to the catalogue. Nothing is hidden or blurred — there is simply nothing published."
                action={
                  <ButtonLink href="/about" variant="secondary">
                    Read how this works
                  </ButtonLink>
                }
              />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((tour, index) => (
                  <TourCard key={tour._id} tour={tour} priority={index < 3} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      <section aria-labelledby="steps-heading" className="bg-surface-muted/60 py-16 sm:py-20">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="Three honest steps"
            description="The same flow for every traveller. No hidden stages and no implied guarantee."
          />
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="relative rounded-2xl border border-line bg-surface p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-on-brand">
                  <step.icon size={20} aria-hidden="true" />
                </span>
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-ink">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-lg text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl bg-ocean-900 px-6 py-12 text-white sm:px-12">
            <div aria-hidden="true" className="absolute inset-0 hero-grain opacity-70" />
            <div className="relative max-w-2xl">
              <h2 className="text-3xl text-white sm:text-4xl">
                Ready to request a departure?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-sand-200">
                Create an account to keep your requests and decisions in one place.
                Browsing stays open to everyone.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href="/register" variant="accent" size="lg">
                  Create an account
                </ButtonLink>
                <Link
                  href="/tours"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Keep browsing
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
