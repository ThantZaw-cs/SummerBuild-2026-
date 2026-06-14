import Link from "next/link";
import { SeverityBadge } from "@/components/SeverityBadge";
import type { CivicReport } from "@/lib/reports";

type ReportCardProps = {
  report: CivicReport;
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <article className="rounded-lg border border-ink/10 bg-white px-5 py-5 shadow-panel">
      <div className="grid gap-5 lg:grid-cols-[1fr_280px] lg:items-start">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-ink/45">
              {report.issueType}
            </span>
            <SeverityBadge severity={report.severity} />
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            {report.title}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-ink/72">
            {report.summary}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-ink/50">
            <span>{report.location}</span>
            <span>{report.status}</span>
            <span>{report.at}</span>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg bg-mist p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-ink/45">
              Priority
            </p>
            <div className="mt-2 h-2 rounded-full bg-white">
              <div
                className="h-2 rounded-full bg-ink"
                style={{ width: `${report.priority}%` }}
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">
              {report.priority}/100
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetaRow label="Auth." value={`${report.auth}/100`} />
            <MetaRow label="Dupes" value={report.dupes.toString()} />
          </div>
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
          href="/submit"
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
    <div className="rounded-lg bg-white px-3 py-2">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{label}</p>
      <p className="mt-1 text-sm font-medium text-ink">{value}</p>
    </div>
  );
}
