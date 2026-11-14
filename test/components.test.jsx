// @vitest-environment jsdom

import { afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BookingTimeline from "@/components/BookingTimeline";
import StatusBadge from "@/components/StatusBadge";

afterEach(cleanup);

describe("status presentation", () => {
  it("shows the raw persisted status plus an accessible explanation", () => {
    render(<StatusBadge status="Rejected" />);
    expect(screen.getByText("Rejected")).toBeTruthy();
    expect(screen.getByText(/raw status: Rejected/)).toBeTruthy();
  });
});

describe("booking timeline presentation", () => {
  it("marks the decision as pending, not complete", () => {
    render(<BookingTimeline booking={{ status: "Pending", createdAt: "2026-03-01T10:00:00.000Z" }} />);

    expect(screen.getByText("Request submitted")).toBeTruthy();
    expect(screen.getByText("Decision pending")).toBeTruthy();
    expect(screen.queryByText("Confirmed")).toBe(null);
  });

  it("renders the stored decision timestamp", () => {
    render(
      <BookingTimeline
        booking={{
          status: "Confirmed",
          createdAt: "2026-03-01T10:00:00.000Z",
          statusUpdatedAt: "2026-03-02T09:30:00.000Z",
        }}
      />,
    );

    expect(screen.getByText("Confirmed")).toBeTruthy();
    expect(screen.getByText(/2 Mar 2026/)).toBeTruthy();
  });
});
