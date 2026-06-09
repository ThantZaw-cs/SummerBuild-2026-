import Link from "next/link";

const features = [
  {
    title: "Fast citizen reporting",
    description:
      "Residents can submit a photo, short description, and location without navigating a complicated form."
  },
  {
    title: "AI-generated maintenance reports",
    description:
      "Future Reka AI support will turn each report into structured issue details, summaries, and recommended actions."
  },
  {
    title: "Priority-based agency dashboard",
    description:
      "Agencies can review the most urgent infrastructure issues first using severity and priority signals."
  }
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="panel overflow-hidden bg-white">
        <div className="grid gap-8 px-6 py-10 lg:grid-cols-[1.08fr_0.92fr] lg:px-10">
          <div className="flex flex-col justify-center gap-6">
            <span className="text-xs font-semibold uppercase tracking-[0.24em] text-moss">
              SummerBuild 2026 MVP
            </span>
            <div className="max-w-3xl space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                CivicLens helps citizens report infrastructure issues faster.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink/75 sm:text-lg">
                Upload a photo, add a short description, and enter a location.
                The current MVP uses mock data to preview how AI-assisted
                reporting and agency prioritization will feel.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/report/new"
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

          <div className="min-h-[320px] overflow-hidden rounded-lg bg-ink">
            <img
              src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1200&q=80"
              alt="City street infrastructure"
              className="h-full w-full object-cover opacity-85"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="panel px-6 py-6">
            <h2 className="text-lg font-semibold text-ink">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-ink/70">
              {feature.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
