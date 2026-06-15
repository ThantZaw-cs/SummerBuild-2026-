import {
  severityStyles,
  severityToDisplay,
  statusStyles,
  type DisplayStatus,
  type Severity
} from "@/lib/reports";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const s = severityStyles[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${s.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {severityToDisplay[severity]}
    </span>
  );
}

export function StatusBadge({ status }: { status: DisplayStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export function PriorityBar({
  value,
  dotClass,
}: {
  value: number;
  dotClass: string;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="w-6 text-[15px] font-extrabold text-ink">{value}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <span
          className={`block h-full rounded-full ${dotClass}`}
          style={{ width: `${value}%` }}
        />
      </span>
    </span>
  );
}
