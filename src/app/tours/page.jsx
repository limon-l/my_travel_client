import { Compass } from "lucide-react";

import TourCatalogue from "./TourCatalogue";
import { Container } from "@/components/ui";
import { loadTours } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Destinations",
  description:
    "Browse every journey in the Wanderlust Atlas catalogue, with the departures operations has actually published.",
};

export default async function ToursPage() {
  const { data: tours, error } = await loadTours();

  return (
    <div className="pb-20 pt-10 sm:pt-12">
      <Container>
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-lagoon-700">
            <Compass size={14} aria-hidden="true" />
            The atlas
          </p>
          <h1 className="text-balance text-4xl leading-tight text-ink sm:text-5xl">
            Every journey, every published departure
          </h1>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Nothing is hidden behind a blur. A journey with no published departure is
            still visible, and it plainly says so. Departures are added by operations
            as real calendar dates.
          </p>
        </div>

        <TourCatalogue tours={tours} error={error} />
      </Container>
    </div>
  );
}
