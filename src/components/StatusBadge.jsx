import { Badge } from "@/components/ui";
import { statusMeta } from "@/lib/booking-status";

export default function StatusBadge({ status, withDot = true, className }) {
  const meta = statusMeta(status);
  return (
    <Badge tone={meta.tone} className={className}>
      {withDot ? (
        <span
          aria-hidden="true"
          className="h-1.5 w-1.5 rounded-full bg-current"
        />
      ) : null}
      {meta.label}
      <span className="sr-only"> (raw status: {status || "unknown"})</span>
    </Badge>
  );
}
