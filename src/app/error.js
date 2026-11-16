"use client";

import { useEffect } from "react";

import { Alert, Button, ButtonLink, Container } from "@/components/ui";

export default function ErrorPage({ error, reset }) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <Container className="py-24">
      <div className="mx-auto max-w-xl">
        <Alert tone="danger" role="alert" title="Something went wrong">
          This page could not finish rendering. No data was changed and no booking was
          altered. You can retry, or return to the catalogue.
        </Alert>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <ButtonLink href="/tours" variant="secondary">
            Browse journeys
          </ButtonLink>
        </div>
        {error?.digest ? (
          <p className="mt-6 text-xs text-ink-subtle">Reference: {error.digest}</p>
        ) : null}
      </div>
    </Container>
  );
}
