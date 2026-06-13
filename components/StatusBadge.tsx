import { statusColors, type DisplayStatus } from "@/lib/mockReports";

type StatusBadgeProps = {
  status: DisplayStatus | string;
  size?: "sm" | "md";
};

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const displayStatus = normalizeStatus(status);
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${statusColors[displayStatus]} ${sizeClasses}`}
    >
      {displayStatus}
    </span>
  );
}

function normalizeStatus(status: string): DisplayStatus {
  const normalized = status.toLowerCase().replaceAll("_", " ");

  if (normalized.includes("resolved")) {
    return "Resolved";
  }

  if (normalized.includes("progress")) {
    return "In Progress";
  }

  if (normalized.includes("verified") || normalized.includes("assigned")) {
    return "Verified";
  }

  if (normalized.includes("rejected")) {
    return "Rejected";
  }

  return "Pending Review";
}
