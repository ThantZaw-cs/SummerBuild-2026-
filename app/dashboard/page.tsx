import { ReportCard } from "@/components/ReportCard";
import { getSortedMockReports } from "@/lib/mockReports";

export default function DashboardPage() {
  const reports = getSortedMockReports();
  const highPriorityCount = reports.filter(
    (report) => report.severity === "High" || report.severity === "Critical"
  ).length;
  const averageAuthenticity = Math.round(
    reports.reduce((total, report) => total + report.authenticityScore, 0) /
      reports.length
  );

  return (
    <div className="flex flex-col gap-6">
      <section className="panel px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
              Agency dashboard
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
              Prioritized infrastructure queue
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/72">
              The dashboard is powered by mock data for now so we can shape the
              experience before wiring in any real backend logic.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total reports" value={reports.length.toString()} />
        <SummaryCard
          label="High/Critical reports"
          value={highPriorityCount.toString()}
        />
        <SummaryCard
          label="Average authenticity"
          value={`${averageAuthenticity}/100`}
        />
      </section>

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-ink">Priority queue</h2>
        <p className="text-sm text-ink/60">Sorted by priority score</p>
      </div>

      <section className="grid gap-5">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </section>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="panel px-6 py-5">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </article>
  );
}
