import { clsx } from "clsx";

const severityStyles = {
  Low: "bg-moss/12 text-moss ring-moss/20",
  Medium: "bg-gold/14 text-amber-700 ring-amber-300/40",
  High: "bg-ember/12 text-ember ring-ember/20",
  Critical: "bg-red-100 text-red-700 ring-red-200"
} as const;

type SeverityBadgeProps = {
  severity: keyof typeof severityStyles;
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ring-1",
        severityStyles[severity]
      )}
    >
      {severity}
    </span>
  );
}
