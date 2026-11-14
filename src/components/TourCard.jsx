import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";

import AvailabilityIndicator from "@/components/AvailabilityIndicator";
import { Badge } from "@/components/ui";
import { formatCurrency, isUpcoming } from "@/lib/dates";

function TourImage({ src, alt, priority = false }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ocean-800 via-ocean-900 to-lagoon-700">
        <span className="font-display text-2xl text-white/70">{alt?.slice(0, 1) || "W"}</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt || "Tour destination"}
      fill
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition duration-700 group-hover:scale-[1.04]"
    />
  );
}

export default function TourCard({ tour, priority = false }) {
  const upcoming = (tour.availableDates || []).filter((date) => isUpcoming(date));

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow hover:shadow-[0_24px_50px_-32px_rgba(13,41,51,0.55)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-200">
        <TourImage src={tour.image} alt={tour.title} priority={priority} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ocean-950/55 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge tone="onDark" className="backdrop-blur">
            {tour.priority || "Standard"}
          </Badge>
          {tour.location ? (
            <Badge tone="onDark" className="backdrop-blur">
              <MapPin size={12} aria-hidden="true" />
              {tour.location}
            </Badge>
          ) : null}
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 text-white">
          <p className="font-display text-xl leading-tight drop-shadow">
            {tour.title}
          </p>
          <p className="whitespace-nowrap rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-ocean-900">
            {formatCurrency(tour.price)}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm leading-relaxed text-ink-muted">
          {tour.shortDesc || "Itinerary details are being prepared for this journey."}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} aria-hidden="true" />
            {tour.duration || "—"} days
          </span>
          <span aria-hidden="true" className="text-line-strong">
            •
          </span>
          <AvailabilityIndicator count={upcoming.length} />
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <Link
            href={`/tours/${tour._id}`}
            className="text-sm font-semibold text-lagoon-700 underline-offset-4 hover:underline"
          >
            View itinerary
          </Link>
          <Link
            href={`/tours/${tour._id}#departures`}
            className="inline-flex items-center gap-1 rounded-full bg-ocean-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-ocean-800"
          >
            {upcoming.length > 0 ? "Choose dates" : "View dates"}
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
