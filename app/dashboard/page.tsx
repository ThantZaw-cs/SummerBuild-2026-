import { ReportCard } from "@/components/ReportCard";
import { getSortedMockReports } from "@/lib/mockReports";

export default function DashboardPage() {
  const reports = getSortedMockReports();

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

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/50">
                Sort
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                Priority score: high to low
              </p>
            </div>
            <div className="rounded-[24px] border border-ink/10 bg-white px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/50">
                Filter
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                Severity filter placeholder
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </section>
    </div>
  );
}
