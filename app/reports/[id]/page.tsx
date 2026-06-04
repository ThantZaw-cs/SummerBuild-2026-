import Link from "next/link";
import { notFound } from "next/navigation";
import { SeverityBadge } from "@/components/SeverityBadge";
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
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="panel overflow-hidden">
        <div className="h-72 bg-gradient-to-br from-tide via-white to-mist" />
        <div className="px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
                Report details
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
                {report.title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-ink/72">
                {report.description}
              </p>
            </div>
            <SeverityBadge severity={report.severity} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <DetailCard label="Location" value={report.locationText} />
            <DetailCard label="Issue type" value={report.issueType} />
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
            {report.generatedReport}
          </p>
        </section>

        <section className="panel px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
            Notes
          </p>
          <p className="mt-4 text-sm leading-7 text-ink/75">
            This page is currently driven by local mock data and a placeholder
            media panel so the base project stays focused on layout and flow.
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
    <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-4">
      <p className="text-xs uppercase tracking-[0.18em] text-ink/50">{label}</p>
      <p className="mt-2 text-sm font-medium capitalize text-ink">{value}</p>
    </div>
  );
}
