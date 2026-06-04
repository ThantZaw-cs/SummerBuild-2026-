import Link from "next/link";
import { mockReports } from "@/lib/mockReports";
import { SeverityBadge } from "@/components/SeverityBadge";

const metrics = [
  { label: "Reports queued", value: "124" },
  { label: "Average submission time", value: "28 sec" },
  { label: "Critical issues flagged", value: "9" }
];

export default function HomePage() {
  const highlightedReport = mockReports[0];

  return (
    <div className="flex flex-col gap-10">
      <section className="panel overflow-hidden">
        <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
              SummerBuild 2026 MVP
            </span>
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                Fast civic reporting for the problems people actually see.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink/75 sm:text-lg">
                CivicLens turns a photo, a short note, and a location into a
                structured maintenance report so citizens can report faster and
                agencies can respond with better priority.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/submit"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink/90"
              >
                Submit Report
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition hover:border-ink/30 hover:bg-ink/5"
              >
                View Dashboard
              </Link>
            </div>
          </div>

          <div className="panel border-0 bg-ink p-6 text-white shadow-none">
            <p className="text-sm uppercase tracking-[0.2em] text-white/60">
              Why this matters
            </p>
            <div className="mt-5 space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Citizen friction</h2>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Long forms, manual categorization, and inconsistent reporting
                  quality make small but important issues easy to ignore.
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Agency overload</h2>
                <p className="mt-2 text-sm leading-6 text-white/72">
                  Teams lose time sorting duplicates, interpreting vague reports,
                  and deciding what should be fixed first.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <article key={metric.label} className="panel px-6 py-5">
            <p className="text-sm text-ink/60">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold text-ink">
              {metric.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="panel px-6 py-6">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
            How it works
          </span>
          <ol className="mt-4 space-y-4 text-sm leading-6 text-ink/75">
            <li>1. Citizens upload a photo or video and type a short description.</li>
            <li>2. CivicLens converts the report into structured maintenance data.</li>
            <li>3. Agencies review severity, priority, and generated recommendations.</li>
          </ol>
        </article>

        <article className="panel px-6 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
                Featured report
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-ink">
                {highlightedReport.title}
              </h2>
            </div>
            <SeverityBadge severity={highlightedReport.severity} />
          </div>
          <p className="mt-4 text-sm leading-6 text-ink/75">
            {highlightedReport.generatedReport}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-tide/45 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/50">
                Location
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {highlightedReport.locationText}
              </p>
            </div>
            <div className="rounded-3xl bg-tide/45 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-ink/50">
                Priority score
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {highlightedReport.priorityScore}/100
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
