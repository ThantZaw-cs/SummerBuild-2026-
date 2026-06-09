import { ReportForm } from "@/components/ReportForm";

export default function NewReportPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
      <section className="panel px-6 py-6">
        <span className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
          Submit a report
        </span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">
          Report an issue in under 30 seconds
        </h1>
        <p className="mt-4 text-sm leading-7 text-ink/72">
          Upload a photo, describe the problem, and enter the location. This MVP
          keeps submissions local to the page until the backend is added later.
        </p>
      </section>

      <ReportForm />
    </div>
  );
}
