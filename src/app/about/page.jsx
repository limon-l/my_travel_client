import Link from "next/link";
import {
  Accessibility,
  BookOpenCheck,
  CircleSlash,
  Compass,
  FileCheck2,
  Fingerprint,
  Lock,
  ShieldCheck,
} from "lucide-react";

import { Alert, Badge, ButtonLink, Container, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "About the atlas",
  description:
    "How Wanderlust Atlas handles availability, requests, decisions and security — including what the product deliberately does not do.",
};

const STATUSES = [
  {
    name: "Pending",
    tone: "warning",
    body: "The request has been recorded and no coordinator has decided yet. It is not a reservation.",
  },
  {
    name: "Confirmed",
    tone: "success",
    body: "Operations approved the request for that departure. This is the only approved state.",
  },
  {
    name: "Rejected",
    tone: "danger",
    body: "Operations declined the request. The departure is released, and the traveller may choose another published date.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-20">
      <section className="relative overflow-hidden bg-ocean-950 text-white">
        <div aria-hidden="true" className="absolute inset-0 hero-grain opacity-90" />
        <Container className="relative py-16 sm:py-20">
          <Badge tone="onDark">
            <Compass size={13} aria-hidden="true" />
            About Wanderlust Atlas
          </Badge>
          <h1 className="mt-6 max-w-3xl text-balance font-display text-4xl leading-tight sm:text-5xl">
            A travel product built around what the database can actually prove.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-sand-200 sm:text-lg">
            Wanderlust Atlas is an independently built portfolio project. It pairs a
            Next.js client with an Express and MongoDB API. The catalogue, departures,
            bookings and decisions are real records — not mocked cards or invented
            social proof.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/tours" variant="accent">
              Browse the catalogue
            </ButtonLink>
            <Link
              href="#booking-model"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Read the booking model
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Why it exists"
            title="A realistic booking workflow, not a landing-page mock"
            description="Most portfolio travel sites stop at a hero image and a fake rating. This one models the awkward parts: a limited departure, a human review step, a state that cannot be re-decided, and a traveller who needs to know exactly where their request stands."
          />

          <div className="space-y-4 rounded-2xl border border-line bg-surface p-6">
            {[
              {
                icon: BookOpenCheck,
                title: "Real catalogue reads",
                body: "Journeys and departures are fetched from the API on every visit. If the API is down, the page says so instead of showing placeholder trips.",
              },
              {
                icon: FileCheck2,
                title: "One-way decisions",
                body: "A Pending request can become Confirmed or Rejected. Terminal states are immutable, so history cannot be quietly rewritten.",
              },
              {
                icon: CircleSlash,
                title: "No invented proof",
                body: "There are no star ratings, testimonials, traveller counts or partner logos in this product, because none could be verified.",
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lagoon-50 text-lagoon-700">
                  <item.icon size={17} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>

      <section id="booking-model" className="scroll-mt-24 border-y border-line bg-surface-muted/60 py-16">
        <Container>
          <SectionHeading
            eyebrow="The booking model"
            title="Three statuses. No fourth meaning."
            description="The persisted values are exactly Pending, Confirmed and Rejected. The interface does not rename them."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {STATUSES.map((status) => (
              <div key={status.name} className="rounded-2xl border border-line bg-surface p-6">
                <Badge tone={status.tone}>{status.name}</Badge>
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">{status.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="text-lg text-ink">Availability is published, not guessed</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Operations publishes calendar dates per journey. A traveller can only
                request a date that is published, in the future, and not already held.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="text-lg text-ink">One active request per departure</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                A database-level unique constraint prevents two travellers from holding
                the same departure, even if both submit at the same moment.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h3 className="text-lg text-ink">No payment step</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                There is no checkout, card field or payment provider in this product. The
                listed price is informational and is re-read from the server when a
                request is created.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Security"
              title="Identity is signed on the server"
              description="The browser never supplies a user id, role or price. Those values are derived from a NextAuth session and a short-lived HMAC token that only the Next.js server can mint."
            />
            <ul className="mt-6 space-y-4">
              {[
                {
                  icon: Fingerprint,
                  title: "No client-supplied identity",
                  body: "The old flow posted userId and price from the browser. Both were removed; the API ignores them.",
                },
                {
                  icon: ShieldCheck,
                  title: "Defence in depth",
                  body: "A same-origin BFF allowlist rebuilds each request body from known fields, and the Express API independently verifies the signed token and ownership.",
                },
                {
                  icon: Lock,
                  title: "Secrets stay server-side",
                  body: "The API base URL and shared signing secret are read on the server. They are not exposed through NEXT_PUBLIC_ variables.",
                },
              ].map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ocean-900 text-white">
                    <item.icon size={17} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHeading
              eyebrow="Accessibility"
              title="Designed toward WCAG 2.2 AA"
              description="Accessibility is treated as part of the product, not a later audit."
            />
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-ink-muted">
              <li className="flex items-start gap-2">
                <Accessibility size={16} className="mt-0.5 shrink-0 text-lagoon-700" aria-hidden="true" />
                A visible skip link, one main landmark, and semantic headings on every page.
              </li>
              <li className="flex items-start gap-2">
                <Accessibility size={16} className="mt-0.5 shrink-0 text-lagoon-700" aria-hidden="true" />
                Status is communicated in text first; colour is supportive only.
              </li>
              <li className="flex items-start gap-2">
                <Accessibility size={16} className="mt-0.5 shrink-0 text-lagoon-700" aria-hidden="true" />
                Native radio inputs for departures, labelled form fields, and a focus-trapped dialog.
              </li>
              <li className="flex items-start gap-2">
                <Accessibility size={16} className="mt-0.5 shrink-0 text-lagoon-700" aria-hidden="true" />
                Transitions collapse under <code className="rounded bg-surface-muted px-1">prefers-reduced-motion</code>.
              </li>
            </ul>

            <Alert tone="info" className="mt-6" title="Honest limitation">
              This is a portfolio deployment. It does not claim third-party accessibility
              certification, PCI compliance, or production-scale availability.
            </Alert>
          </div>
        </div>

        <div className="mt-16 rounded-3xl bg-ocean-900 px-6 py-10 text-white sm:px-10">
          <h2 className="text-3xl text-white">What this product deliberately omits</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <ul className="space-y-2 text-sm leading-relaxed text-sand-200">
              <li>No star ratings or review scores.</li>
              <li>No testimonials or named travellers.</li>
              <li>No “10,000 happy customers” style totals.</li>
            </ul>
            <ul className="space-y-2 text-sm leading-relaxed text-sand-200">
              <li>No payment processing or card storage.</li>
              <li>No live airline or hotel inventory.</li>
              <li>No guarantee that a request will be confirmed.</li>
            </ul>
          </div>
          <div className="mt-8">
            <ButtonLink href="/tours" variant="accent">
              See what is actually published
            </ButtonLink>
          </div>
        </div>
      </Container>
    </div>
  );
}
