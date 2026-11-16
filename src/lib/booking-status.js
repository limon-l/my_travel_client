/**
 * The only booking states in the persisted model. Nothing here introduces a new
 * status; this maps the three real values to honest, traveller-facing language.
 */

export const BOOKING_STATUS = Object.freeze({
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
});

export const STATUS_META = Object.freeze({
  Pending: {
    label: "Pending",
    tone: "warning",
    summary: "Submitted — an operations coordinator has not decided yet.",
    longDescription:
      "This is a request, not a confirmed reservation. You will see the decision here once operations review it.",
  },
  Confirmed: {
    label: "Confirmed",
    tone: "success",
    summary: "Approved by operations for the selected departure.",
    longDescription:
      "Your place on this departure has been approved. Keep this reference for your records.",
  },
  Rejected: {
    label: "Rejected",
    tone: "danger",
    summary: "Operations declined this request.",
    longDescription:
      "This request will not go ahead. You are welcome to choose another published departure.",
  },
});

export function statusMeta(status) {
  return (
    STATUS_META[status] || {
      label: status || "Unknown",
      tone: "neutral",
      summary: "Status unavailable.",
      longDescription: "We could not interpret this booking status.",
    }
  );
}

/**
 * Builds a truthful timeline. Only real timestamps are shown; the final step is
 * never rendered as complete before a decision exists.
 */
export function buildTimeline(booking) {
  const status = booking?.status;
  const submittedAt = booking?.createdAt || null;
  const decidedAt = booking?.statusUpdatedAt || null;

  const steps = [
    {
      id: "submitted",
      title: "Request submitted",
      description: "Your departure request was recorded.",
      timestamp: submittedAt,
      state: "complete",
    },
    {
      id: "review",
      title: "Operations review",
      description:
        status === BOOKING_STATUS.PENDING
          ? "A coordinator is reviewing this request."
          : "Review completed.",
      timestamp: null,
      state: status === BOOKING_STATUS.PENDING ? "current" : "complete",
    },
  ];

  if (status === BOOKING_STATUS.CONFIRMED) {
    steps.push({
      id: "decision",
      title: "Confirmed",
      description: "Operations approved this departure.",
      timestamp: decidedAt,
      state: "complete",
      tone: "success",
    });
  } else if (status === BOOKING_STATUS.REJECTED) {
    steps.push({
      id: "decision",
      title: "Rejected",
      description: "Operations rejected this request.",
      timestamp: decidedAt,
      state: "stopped",
      tone: "danger",
    });
  } else {
    steps.push({
      id: "decision",
      title: "Decision pending",
      description: "Awaiting a Confirmed or Rejected decision.",
      timestamp: null,
      state: "upcoming",
    });
  }

  return steps;
}
