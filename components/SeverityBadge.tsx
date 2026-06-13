import { clsx } from "clsx";
import type { Severity } from "@/lib/mockReports";

const severityStyles = {
  Low: {
    wrapper: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500"
  },
  Medium: {
    wrapper: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500"
  },
  High: {
    wrapper: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500"
  },
  Critical: {
    wrapper: "bg-red-50 text-red-700 border-red-200",
    dot: "bg-red-500"
  }
} as const;

type SeverityBadgeProps = {
  severity: Severity;
  size?: "sm" | "md";
};

export function SeverityBadge({ severity, size = "sm" }: SeverityBadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        severityStyles[severity].wrapper,
        sizeClasses
      )}
    >
      <span className={clsx("h-1.5 w-1.5 rounded-full", severityStyles[severity].dot)} />
      {severity}
    </span>
  );
}
