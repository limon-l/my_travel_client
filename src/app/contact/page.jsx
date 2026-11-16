import Link from "next/link";
import { BookOpen, Github, LifeBuoy, ShieldAlert } from "lucide-react";

import { Alert, Badge, ButtonLink, Container, SectionHeading } from "@/components/ui";

export const metadata = {
  title: "Contact",
  description:
    "How to reach the Wanderlust Atlas project, and where to report a booking or security issue.",
};

const CLIENT_REPO = "https://github.com/limon-l/my_travel_client";
const SERVER_REPO = "https://github.com/limon-l/my_travel_server";

export default function ContactPage() {
  return (
    <div className="pb-20">
      <section className="border-b border-line bg-surface">
        <Container className="py-14 sm:py-16">
          <Badge tone="lagoon">
            <LifeBuoy size={13} aria-hidden="true" />
            Contact
          </Badge>
          <h1 className="mt-5 max-w-2xl text-balance text-4xl leading-tight text-ink sm:text-5xl">
            Talk to the project, not a fake call centre
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            There is no invented support phone number, street address or contact form
            here. Wanderlust Atlas is an open portfolio project, so the real channels are
            its repositories and issues.
          </p>
        </Container>
      </section>

      <Container className="py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              eyebrow="Open source"
              title="Where to reach us"
              description="Issues are the most reliable channel. Include the request reference shown on your trip card when reporting a booking problem."
            />

            <ul className="mt-8 space-y-4">
              <li>
                <a
                  href={CLIENT_REPO}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_20px_45px_-32px_rgba(13,41,51,0.5)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-900 text-white">
                    <Github size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-base font-semibold text-ink">
                      Client repository
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                      Next.js app, accessibility fixes and interface issues.
                    </span>
                    <span className="mt-1 block text-xs font-medium text-lagoon-700">
                      github.com/limon-l/my_travel_client
                    </span>
                  </span>
                </a>
              </li>

              <li>
                <a
                  href={SERVER_REPO}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition-shadow hover:shadow-[0_20px_45px_-32px_rgba(13,41,51,0.5)]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lagoon-600 text-white">
                    <BookOpen size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-base font-semibold text-ink">
                      API repository
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-muted">
                      Express API, booking rules, database indexes and deployment notes.
                    </span>
                    <span className="mt-1 block text-xs font-medium text-lagoon-700">
                      github.com/limon-l/my_travel_server
                    </span>
                  </span>
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="rounded-2xl border border-line bg-surface p-6">
              <h2 className="text-xl text-ink">Before you write</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
                <li>
                  <span className="font-semibold text-ink">Booking question?</span> Open the
                  journey from{" "}
                  <Link href="/dashboard/bookings" className="font-semibold text-lagoon-700 underline-offset-4 hover:underline">
                    My trips
                  </Link>{" "}
                  and include the reference shown on the card.
                </li>
                <li>
                  <span className="font-semibold text-ink">No departure showing?</span> That
                  means operations has not published one. It is not a sold-out signal.
                </li>
                <li>
                  <span className="font-semibold text-ink">Need to change a decision?</span>{" "}
                  Confirmed and Rejected are terminal in this product. A new request for a
                  different published date is the supported path.
                </li>
              </ul>
            </div>

            <Alert tone="warning" className="mt-6" title="Security reports">
              <span className="flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                Please do not open a public issue containing a password, session cookie,
                database URI or signing secret. Report the affected route and the observed
                behaviour only.
              </span>
            </Alert>

            <div className="mt-6">
              <ButtonLink href="/tours" variant="secondary">
                Back to the catalogue
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
