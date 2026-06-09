import Link from "next/link";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { MockReport } from "@/lib/mockReports";

type ReportCardProps = {
  report: MockReport;
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <article className="panel px-6 py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <SeverityBadge severity={report.severity} />
            <span className="text-xs uppercase tracking-[0.18em] text-ink/45">
              {report.status}
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-ink/45">
              {report.createdAt}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              {report.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/72">
              {report.aiSummary}
            </p>
          </div>
        </div>

        <div className="grid min-w-[220px] gap-3 rounded-lg bg-tide/50 p-4">
          <MetaRow label="Priority" value={`${report.priorityScore}/100`} />
          <MetaRow label="Authenticity" value={`${report.authenticityScore}/100`} />
          <MetaRow label="Location" value={report.location} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={`/reports/${report.id}`}
          className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
        >
          View details
        </Link>
        <Link
          href="/report/new"
          className="rounded-full border border-ink/15 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-ink/30 hover:bg-ink/5"
        >
          Add another report
        </Link>
      </div>
    </article>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
