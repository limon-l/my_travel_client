import { describe, expect, it } from "vitest";

import { BOOKING_STATUS, buildTimeline, statusMeta } from "@/lib/booking-status";

describe("booking status vocabulary", () => {
  it("keeps the persisted status names unchanged", () => {
    expect(BOOKING_STATUS.PENDING).toBe("Pending");
    expect(BOOKING_STATUS.CONFIRMED).toBe("Confirmed");
    expect(BOOKING_STATUS.REJECTED).toBe("Rejected");
    expect(statusMeta("Pending").label).toBe("Pending");
    expect(statusMeta("Confirmed").label).toBe("Confirmed");
    expect(statusMeta("Rejected").label).toBe("Rejected");
  });

  it("falls back without inventing a status", () => {
    expect(statusMeta("Cancelled").label).toBe("Cancelled");
    expect(statusMeta(undefined).tone).toBe("neutral");
  });
});

describe("booking timeline", () => {
  const submitted = "2026-03-01T10:00:00.000Z";
  const decided = "2026-03-02T09:30:00.000Z";

  it("does not mark a decision complete while the request is Pending", () => {
    const steps = buildTimeline({ status: "Pending", createdAt: submitted });
    expect(steps.map((step) => step.state)).toEqual(["complete", "current", "upcoming"]);
    expect(steps[2].timestamp).toBe(null);
    expect(steps[2].title).toBe("Decision pending");
  });

  it("uses the real decision timestamp when Confirmed", () => {
    const steps = buildTimeline({
      status: "Confirmed",
      createdAt: submitted,
      statusUpdatedAt: decided,
    });
    expect(steps[2].state).toBe("complete");
    expect(steps[2].timestamp).toBe(decided);
    expect(steps[2].title).toBe("Confirmed");
  });

  it("stops the timeline at a Rejected decision", () => {
    const steps = buildTimeline({
      status: "Rejected",
      createdAt: submitted,
      statusUpdatedAt: decided,
    });
    expect(steps[1].state).toBe("complete");
    expect(steps[2].state).toBe("stopped");
    expect(steps[2].title).toBe("Rejected");
  });
});
