import { CalendarCheck, CalendarX } from "lucide-react";

import { Badge } from "@/components/ui";

/**
 * Availability is communicated with text first. Colour is supportive only, so
 * the state remains understandable without colour perception.
 */
export default function AvailabilityIndicator({ count = 0, label, className }) {
  const available = count > 0;

  return (
    <Badge tone={available ? "success" : "warning"} className={className}>
      {available ? (
        <CalendarCheck size={13} aria-hidden="true" />
      ) : (
        <CalendarX size={13} aria-hidden="true" />
      )}
      {label ||
        (available
          ? `${count} published departure${count === 1 ? "" : "s"}`
          : "No published departures")}
    </Badge>
  );
}
