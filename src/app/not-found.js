import { Compass } from "lucide-react";

import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
          <Compass size={26} aria-hidden="true" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-brand-ink">
          404
        </p>
        <h1 className="mt-2 text-4xl text-ink">This page is not on the map</h1>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          The link may be outdated, or the journey may have been removed from the
          catalogue. Nothing is being hidden behind a redirect.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/tours" variant="primary">
            Browse all journeys
          </ButtonLink>
          <ButtonLink href="/" variant="secondary">
            Return home
          </ButtonLink>
        </div>
      </div>
    </Container>
  );
}
