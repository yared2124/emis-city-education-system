import { Badge } from "@/components/ui";

import type { BadgeTone } from "@/components/ui";

const STATUS_TONES: Record<string, BadgeTone> = {
  ACTIVE: "success",
  ARCHIVED: "neutral",
  PENDING: "warning",
  UNDER_REVIEW: "info",
  APPROVED: "success",
  REJECTED: "danger",
  COMPLETED: "brand",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONES[status] ?? "neutral"}>{status}</Badge>;
}
