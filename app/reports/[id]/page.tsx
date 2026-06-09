import Link from "next/link";
import { SeverityBadge } from "@/components/SeverityBadge";
import { SupabaseReportDetails } from "@/components/SupabaseReportDetails";
import { getMockReportById } from "@/lib/mockReports";

type ReportDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ReportDetailsPage({
  params
}: ReportDetailsPageProps) {
  const { id } = await params;
  const report = getMockReportById(id);

  if (!report) {
    return <SupabaseReportDetails reportId={id} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="panel overflow-hidden">
        <div className="h-72 bg-tide">
          <img
            src={report.imageUrl}
            alt={report.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
                Report details
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                {report.title}
              </h1>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink/45">
                User description
              </p>
              <p className="mt-2 text-sm leading-7 text-ink/72">
                {report.description}
              </p>
            </div>
            <SeverityBadge severity={report.severity} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <DetailCard label="Issue type" value={report.issueType} />
            <DetailCard label="Severity" value={report.severity} />
            <DetailCard label="Location" value={report.location} />
            <DetailCard
              label="Authenticity score"
              value={`${report.authenticityScore}/100`}
            />
            <DetailCard
              label="Priority score"
              value={`${report.priorityScore}/100`}
            />
            <DetailCard label="Status" value={report.status} />
            <DetailCard label="Created" value={report.createdAt} />
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="panel px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
            AI-generated maintenance report
          </p>
          <p className="mt-4 text-sm leading-7 text-ink/75">
            {report.aiSummary}
          </p>
        </section>

        <section className="panel px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
            Recommended action
          </p>
          <p className="mt-4 text-sm leading-7 text-ink/75">
            {report.recommendedAction}
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
          >
            Back to dashboard
          </Link>
        </section>
      </aside>
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{label}</p>
      <p className="mt-2 text-sm font-medium capitalize text-ink">{value}</p>
    </div>
  );
}
