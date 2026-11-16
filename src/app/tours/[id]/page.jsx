import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import BookingPanel from "@/components/BookingPanel";
import AvailabilityIndicator from "@/components/AvailabilityIndicator";
import TourCard from "@/components/TourCard";
import { Alert, Badge, ButtonLink, Container } from "@/components/ui";
import {
  findActiveBooking,
  loadAvailability,
  loadTour,
  loadTours,
} from "@/lib/catalogue";
import { formatCurrency, formatDeparture, isUpcoming } from "@/lib/dates";
import { getIdentity, getSession } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

function plain(value) {
  return typeof value === "string" ? value.trim() : "";
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { data: tour } = await loadTour(id);
  if (!tour) return { title: "Journey not found" };
  const description =
    plain(tour.shortDesc) ||
    `Published departures and booking requests for ${tour.title} in the Wanderlust Atlas.`;
  return {
    title: tour.title,
    description,
    openGraph: {
      title: tour.title,
      description,
      images: tour.image ? [{ url: tour.image }] : undefined,
    },
  };
}

export default async function TourDetailPage({ params }) {
  const { id } = await params;
  const [{ data: tour, error, notFound: missing }, availability, session, catalogue] =
    await Promise.all([
      loadTour(id),
      loadAvailability(id),
      getSession(),
      loadTours(),
    ]);

  if (missing) notFound();

  if (!tour) {
    return (
      <Container className="py-16">
        <Alert tone="danger" role="alert" title="This journey could not be loaded">
          {error} Please retry in a moment.
        </Alert>
        <div className="mt-6">
          <ButtonLink href="/tours" variant="secondary">
            Back to all journeys
          </ButtonLink>
        </div>
      </Container>
    );
  }

  const identity = await getIdentity();
  const existingBooking = await findActiveBooking(identity, tour._id);

  const published = Array.isArray(tour.availableDates)
    ? tour.availableDates.filter((date) => isUpcoming(date))
    : [];
  const freeDates = availability.dates;
  const duration = Number(tour.duration) > 0 ? Number(tour.duration) : null;
  const fullDescription = plain(tour.fullDesc) || plain(tour.shortDesc);

  const others = (Array.isArray(catalogue?.data) ? catalogue.data : []).filter(
    (item) => item._id !== tour._id,
  );
  const related = [
    ...others.filter((item) => item.priority === tour.priority),
    ...others.filter((item) => item.priority !== tour.priority),
  ].slice(0, 3);

  return (
    <div className="pb-28 pt-8 sm:pt-10 lg:pb-20">
      <Container>
        <Link
          href="/tours"
          className="inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All journeys
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
          <div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-line bg-surface-muted">
              {tour.image ? (
                <Image
                  src={tour.image}
                  alt={tour.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 62vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ocean-800 via-ocean-900 to-lagoon-700">
                  <Compass size={56} className="text-white/60" aria-hidden="true" />
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ocean-950/80 to-transparent p-5 sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="onDark">{tour.priority || "Standard"}</Badge>
                  {tour.location ? (
                    <Badge tone="onDark">
                      <MapPin size={12} aria-hidden="true" />
                      {tour.location}
                    </Badge>
                  ) : null}
                </div>
                <h1 className="mt-3 text-balance font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                  {tour.title}
                </h1>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-line bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Duration
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <Clock size={14} aria-hidden="true" className="text-brand-ink" />
                  {duration ? `${duration} days` : "Not set"}
                </dd>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  From
                </dt>
                <dd className="mt-1 text-sm font-semibold text-brand-ink">
                  {formatCurrency(tour.price)}
                </dd>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Published
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <CalendarDays size={14} aria-hidden="true" className="text-brand-ink" />
                  {published.length} departure{published.length === 1 ? "" : "s"}
                </dd>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-ink-subtle">
                  Bookable now
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {availability.error ? "Unavailable" : freeDates.length}
                </dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AvailabilityIndicator
                count={freeDates.length}
                label={
                  availability.error
                    ? "Availability could not be checked"
                    : freeDates.length > 0
                      ? `${freeDates.length} departure${freeDates.length === 1 ? "" : "s"} open to request`
                      : published.length > 0
                        ? "All published departures are taken"
                        : "No published departures"
                }
              />
              {availability.publishedCount > 0 && freeDates.length !== availability.publishedCount ? (
                <span className="text-xs text-ink-muted">
                  {availability.publishedCount} published,{" "}
                  {availability.publishedCount - freeDates.length} already held or past.
                </span>
              ) : null}
            </div>

            <section aria-labelledby="overview-heading" className="mt-10">
              <h2 id="overview-heading" className="text-2xl text-ink">
                Trip overview
              </h2>
              {fullDescription ? (
                <p className="rich-text mt-4 text-base">{fullDescription}</p>
              ) : (
                <Alert tone="neutral" className="mt-4">
                  Operations has not added a detailed itinerary for this journey yet.
                  Nothing is being invented to fill the space.
                </Alert>
              )}
            </section>

            <section aria-labelledby="departures-heading" className="mt-10 scroll-mt-24" id="departures">
              <h2 id="departures-heading" className="text-2xl text-ink">
                Departures
              </h2>
              {freeDates.length > 0 ? (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {freeDates.map((date) => (
                    <li
                      key={date}
                      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3"
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <Sparkles size={14} aria-hidden="true" className="text-sunset-600" />
                        {formatDeparture(date, { withWeekday: true })}
                      </span>
                      <span className="text-xs font-medium text-success">Open to request</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <Alert tone="warning" className="mt-4" title="No open departures">
                  {availability.error
                    ? availability.error
                    : "Operations has not published a future departure that is free to request. This is not a sold-out claim — it reflects the stored schedule."}
                </Alert>
              )}
            </section>

            <p className="mt-8 flex items-start gap-2 rounded-xl border border-line bg-surface-muted px-4 py-3 text-xs leading-relaxed text-ink-muted">
              <ShieldCheck size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              Prices and durations come from the stored tour record. The server
              re-reads them when a request is created, so a browser cannot change what
              is owed.
            </p>
          </div>

          <aside id="booking-panel" className="scroll-mt-24 lg:sticky lg:top-24">
            <BookingPanel
              tour={tour}
              initialAvailableDates={freeDates}
              existingBooking={existingBooking}
            />
            {session?.user ? null : (
              <p className="mt-3 text-center text-xs text-ink-subtle">
                <Link href="/login" className="font-semibold text-brand-ink underline-offset-4 hover:underline">
                  Sign in
                </Link>{" "}
                to request a departure.
              </p>
            )}
          </aside>
        </div>

        {related.length > 0 ? (
          <section aria-labelledby="related-heading" className="mt-16">
            <h2 id="related-heading" className="text-2xl text-ink">
              Other journeys to consider
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-ink-muted">
              Drawn from the same catalogue. Every card reflects its own stored price,
              duration and published departures.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <TourCard key={item._id} tour={item} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>

      {/* Mobile-only booking shortcut. Desktop keeps the sticky aside. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-10px_30px_-24px_rgba(6,23,29,0.8)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              From
            </p>
            <p className="text-base font-semibold text-ink">{formatCurrency(tour.price)}</p>
          </div>
          <ButtonLink href="#booking-panel" variant="primary">
            Choose a departure
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
